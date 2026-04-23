import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RefundLocators — The bank may owe you money.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
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
        {/* Background gradient orb */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,162,74,0.18) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(201,162,74,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
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

        {/* Eyebrow */}
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
            Surplus Fund Intelligence · Ohio
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
            You lost a home in Ohio.
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
            The bank may owe you money.
          </span>
        </div>

        {/* Subtext */}
        <span style={{ fontSize: 22, color: 'rgba(240,236,228,0.55)', fontWeight: 400, lineHeight: 1.5, maxWidth: 640 }}>
          Type your address. In 10 seconds we'll tell you if there's surplus waiting — and exactly how much.
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
