import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';
import { copyFor, type Relationship } from './copy';

// Per-token OpenGraph image — same design language as the site-wide
// /opengraph-image, with the lead's name + amount + county dusted in.
// Per Nathan 2026-04-28: keep the "You lost a home in Ohio / bank may owe
// you money" rhythm and color scheme, just personalize subtly so when the
// recipient sees the iMessage preview they instantly recognize their own
// case and trust the click.

export const runtime = 'edge';
export const alt = 'RefundLocators — your case';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  // Next.js 16: dynamic segment params arrive as a Promise. Awaiting is
  // mandatory — accessing `params.token` synchronously yields undefined.
  params: Promise<{ token: string }>;
}

function fmtMoney(n: number | null): string {
  if (n == null) return '';
  return '$' + Math.round(n).toLocaleString('en-US');
}

export default async function OGImage({ params }: Props) {
  const { token } = await params;
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data } = await db
    .from('personalized_links')
    .select('first_name, last_name, property_address, county, estimated_surplus_low, estimated_surplus_high, relationship')
    .eq('token', token)
    .single();

  const surplus = data?.estimated_surplus_low ?? data?.estimated_surplus_high ?? null;
  const surplusFmt = surplus != null ? fmtMoney(surplus) : null;
  const county = (data?.county || '').trim();
  const address = (data?.property_address || '').trim();

  // Street View backdrop. Same idea as the website hero — the photo of
  // the property, heavily darkened, behind the gold-on-cream text. The
  // photo is the same regardless of relationship (it's a deal-level
  // fact). Falls back to the plain dark background if no address.
  const photoAddress = address && county
    ? `${address}, ${county} County, OH`
    : (address || '');
  const photoUrl = photoAddress
    ? `https://refundlocators.com/api/streetview?address=${encodeURIComponent(photoAddress)}&w=640&h=400`
    : null;

  // Pull eyebrow / headline / subtext from the shared copy helper so all
  // three render surfaces (page, OG image, iMessage title/description)
  // stay aligned per relationship.
  const copy = copyFor({
    firstName: data?.first_name ?? null,
    lastName: data?.last_name ?? null,
    propertyAddress: data?.property_address ?? null,
    county: data?.county ?? null,
    surplusFmt,
    relationship: ((data?.relationship as Relationship) || 'homeowner'),
  });
  const eyebrow = copy.ogEyebrow;
  const headlineWhite = copy.headlineWhite;
  const headlineGold = copy.headlineGold;
  const subtext = copy.subtext;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          background: '#05111f',
          padding: '72px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Street View of the property — full-bleed backdrop. Heavily
            dimmed via the gradient overlay below so the type stays
            legible. */}
        {photoUrl && (
          <img
            src={photoUrl}
            width={1200}
            height={630}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.5) saturate(0.9)',
            }}
          />
        )}
        {/* Dim gradient over the photo. Lighter at top so the house
            shows through, dark at bottom where the headline + subtext
            live so they read crisp. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(180deg, rgba(5,17,31,0.35) 0%, rgba(5,17,31,0.55) 45%, rgba(5,17,31,0.92) 100%)',
          }}
        />
        {/* Brand gradient orbs (kept from site-wide image, but dimmer
            so they don't fight the photo). */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,162,74,0.14) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 200,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,162,74,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Logo (top-left) */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: '#c9a24a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 900,
              color: '#05111f',
            }}
          >
            R
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#f0ece4', letterSpacing: '-0.02em' }}>
            RefundLocators
          </span>
        </div>

        {/* Eyebrow pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(201,162,74,0.12)',
            border: '1px solid rgba(201,162,74,0.3)',
            borderRadius: 999,
            padding: '6px 16px',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#c9a24a',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#c9a24a', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {eyebrow}
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 40 }}>
          <span
            style={{
              fontSize: 62,
              fontWeight: 900,
              color: '#f0ece4',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
            }}
          >
            {headlineWhite}
          </span>
          <span
            style={{
              fontSize: 62,
              fontWeight: 900,
              color: '#c9a24a',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
            }}
          >
            {headlineGold}
          </span>
        </div>

        {/* Subtext */}
        <span style={{ fontSize: 22, color: 'rgba(240,236,228,0.55)', fontWeight: 400, lineHeight: 1.5, maxWidth: 920 }}>
          {subtext}
        </span>

        {/* Bottom right — domain */}
        <span
          style={{
            position: 'absolute',
            bottom: 56,
            right: 80,
            fontSize: 16,
            color: 'rgba(240,236,228,0.3)',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          refundlocators.com
        </span>
      </div>
    ),
    { ...size },
  );
}
