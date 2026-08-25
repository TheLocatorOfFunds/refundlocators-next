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

// Branded dead-end for missing or expired links. People open texts days or
// weeks late — a bare 404 kills the lead silently, so give them a way back
// in (address search on the homepage, or text the team directly).
function LinkFallback({ firstName }: { firstName?: string | null }) {
  const name = (firstName || '').trim();
  return (
    <div className="pass-root" data-bg="flat" data-gold="full">
      <div className="pass-fallback">
        <header className="pass-top">
          <span className="pass-top-domain">refundlocators.com</span>
        </header>
        <h1 className="pass-fallback-title">
          {name ? `${name}, this` : 'This'} secure link is no longer active.
        </h1>
        <p className="pass-fallback-body">
          Personalized links expire after 90 days for your privacy — but if there
          was surplus money attached to a property, it doesn&apos;t go away when the
          link does. It stays with the county until it&apos;s claimed or the claim
          window closes.
        </p>
        <div className="pass-fallback-actions">
          <a className="pass-cta-primary" href="/">
            <span>Search my address</span>
            <span className="pass-arrow" aria-hidden="true">→</span>
          </a>
          <a className="pass-cta-secondary" href="sms:+15135162306?&body=Hi%2C%20my%20RefundLocators%20link%20expired%20%E2%80%94%20can%20you%20send%20a%20new%20one%3F">
            Text us for a fresh link
          </a>
        </div>
        <div className="pass-legal">
          FundLocators LLC · Licensed Ohio attorney files · Contingency fee in writing · $0 upfront
        </div>
      </div>
    </div>
  );
}

export default async function PersonalizedPage({ params }: Props) {
  const { token } = await params;

  // Obvious junk (crawler probes, truncated URLs) still gets a plain 404.
  if (!/^[1-9A-HJ-NP-Za-km-z]{4,12}$/.test(token)) return notFound();

  const db = getDB();

  const { data: link } = await db
    .from('personalized_links')
    .select('*')
    .eq('token', token)
    .single();

  if (!link) return <LinkFallback />;
  if (new Date(link.expires_at) < new Date()) {
    return <LinkFallback firstName={link.first_name} />;
  }

  // View counting happens client-side via /api/s/event ('viewed') — SMS
  // link-preview bots fetch this page to build the preview card, so a
  // server-render increment would count people who never opened the link.

  return <PersonalizedClient link={link as PersonalizedLink} />;
}
