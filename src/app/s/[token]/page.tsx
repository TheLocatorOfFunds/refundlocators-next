import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import PersonalizedClient from './PersonalizedClient';
import type { PersonalizedLink } from '@/lib/supabase';
import { copyFor, type Relationship } from './copy';
import './pass.css';
import './lauren-ai.css';

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

  // Record the view (fire-and-forget)
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
