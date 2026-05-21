import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import PersonalizedClient from './PersonalizedClient';
import type { PersonalizedLink } from '@/lib/supabase';
import { copyFor, type Relationship } from './copy';
import './pass.css';
import './lauren-ai.css';

// IPs / user-agent fragments we know belong to the team. Any view from
// these gets is_team_view=true so the engagement view excludes them.
// Set TEAM_VIEW_IPS as a CSV in Vercel env (e.g. "192.0.2.1,203.0.113.4")
// when Nathan/Justin/Eric/Inaam IPs are known. Leave unset to start —
// at minimum we'll capture EVERY view with full IP/UA so retroactive
// filtering is possible from raw data.
function isTeamView(ip: string | null, ua: string | null): boolean {
  const teamIps = (process.env.TEAM_VIEW_IPS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (ip && teamIps.includes(ip)) return true;
  // Crude UA heuristic — flag headless browsers + dev tools so seo
  // crawlers / Vercel preview bots don't pollute the engagement count.
  if (ua && /HeadlessChrome|Puppeteer|Playwright|node-fetch|curl|Postman|axios/i.test(ua)) return true;
  return false;
}

// Server-side fetch — uses service role key
function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const db = getDB();
  const { data } = await db
    .from('personalized_links')
    .select('first_name, last_name, property_address, county, estimated_surplus_low, estimated_surplus_high, relationship')
    .eq('token', token)
    .single();

  if (!data) {
    return { title: 'FundLocators' };
  }

  // Pull relationship-aware copy through the shared template helper so
  // the iMessage title + description align with the OG image headline
  // + the page hero.
  const surplus = data.estimated_surplus_low ?? data.estimated_surplus_high ?? null;
  const surplusFmt = typeof surplus === 'number'
    ? `$${Math.round(surplus).toLocaleString('en-US')}`
    : null;
  const copy = copyFor({
    firstName: data.first_name,
    lastName: data.last_name,
    propertyAddress: data.property_address,
    county: data.county,
    surplusFmt,
    relationship: ((data.relationship as Relationship) || 'homeowner'),
  });

  const pageUrl = `https://refundlocators.com/s/${token}`;

  // Note: og:image is auto-wired by ./opengraph-image.tsx — a dynamic
  // image route that bakes the lead's name + amount into the same gold-
  // on-dark design as the site-wide preview. Don't set images here or
  // it overrides Next.js's file-based detection.
  return {
    title: copy.title,
    description: copy.description,
    robots: { index: false, follow: false }, // never index personal pages
    openGraph: {
      type: 'website',
      url: pageUrl,
      siteName: 'RefundLocators',
      title: copy.title,
      description: copy.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
    },
  };
}

export default async function PersonalizedPage({ params }: Props) {
  const { token } = await params;
  const db = getDB();

  const { data: link } = await db
    .from('personalized_links')
    .select('*')
    .eq('token', token)
    .single();

  // Not found or expired
  if (!link) return notFound();
  if (new Date(link.expires_at) < new Date()) return notFound();

  // ── Per-view audit (added 2026-05-08) ──
  // Capture IP, user-agent, referer on EVERY load. Lets the team
  // distinguish real engagement from team testing or refresh-spam.
  // Without this, view_count is just a counter — couldn't tell a
  // homeowner from a Nathan QA pass.
  // See: deal-command-center migration 20260508170000_personalized_link_views.sql
  // Visitor_id (long-lived cookie) deferred to v2 — IP+UA fingerprint
  // is good enough for distinguishing distinct browsers on first pass.
  const hdrs = await headers();
  const fwdFor = hdrs.get('x-forwarded-for') || '';
  const ip = (fwdFor.split(',')[0] || hdrs.get('x-real-ip') || '').trim() || null;
  const userAgent = hdrs.get('user-agent') || null;
  const referer = hdrs.get('referer') || null;

  // Fire-and-forget: per-view audit row.
  db.from('personalized_link_views').insert({
    token,
    ip_address: ip,
    user_agent: userAgent,
    referer,
    visitor_id: null,
    is_team_view: isTeamView(ip, userAgent),
  }).then(() => null);

  // Keep the legacy counter + first/last_viewed_at on personalized_links
  // updated so the existing Leads UI doesn't break. The new audit table
  // is the source of truth for engagement; this is just for back-compat.
  db.from('personalized_links')
    .update({
      view_count: (link.view_count || 0) + 1,
      last_viewed_at: new Date().toISOString(),
      first_viewed_at: link.first_viewed_at ?? new Date().toISOString(),
    })
    .eq('token', token)
    .then(() => null);

  return <PersonalizedClient link={link as PersonalizedLink} />;
}
