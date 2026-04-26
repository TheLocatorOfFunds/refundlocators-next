'use client';

/**
 * HomeClient — minimal address-lookup hero.
 *
 * Mirrors the .home-* class set in pass.css (shipped with the design).
 * Uses /api/search to look up a former address. On success we either
 * redirect to /s/{token} (when a personalized link exists) or render a
 * "we found something" callout that nudges the user to text Nathan with
 * the address pre-filled.
 */

import { useRef, useState } from 'react';
import type { SearchResult } from '@/lib/supabase';
import LaurenSheet from '@/components/LaurenSheet';

// Format a recovery total as "$2.1M" / "$425k" / "$8,420"
function fmtRecoveryTotal(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${m >= 10 ? Math.round(m) : m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString('en-US')}`;
}

export default function HomeClient() {
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [laurenOpen, setLaurenOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Public-facing recovery total — set by Nathan, not pulled from /api/ticker.
  const recoveryTotal: number = 2_400_000;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || busy) return;
    setError('');
    setBusy(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });

      if (res.status === 429) {
        setError('Too many searches. Try again in an hour, or text us directly.');
        return;
      }

      const data: SearchResult = await res.json();
      setResult(data);
    } catch {
      setError('Something went wrong. Text us directly and we will help.');
    } finally {
      setBusy(false);
    }
  };

  // Result tile copy — keep it factual, never overpromise.
  const resultTile = (() => {
    if (!result) return null;

    if (result.status === 'confirmed' || result.status === 'likely') {
      const c = result.case;
      const range = result.estimated_surplus;
      const rangeStr = range
        ? ` Roughly $${Math.round(range.low / 1000)}k–$${Math.round(range.high / 1000)}k.`
        : '';
      return {
        title: 'We found something on this address.',
        body: (
          <>
            <strong>{c?.county || 'The county'} County</strong> court records show
            a sheriff&apos;s sale that may have left a surplus.{rangeStr} Text us
            and we will pull your case file and walk you through it — free.
          </>
        ),
      };
    }

    if (result.status === 'needs_verification') {
      return {
        title: 'Maybe — we need a closer look.',
        body: (
          <>
            The address turned up partial matches in the public court records.
            Text us the address as it appeared on the deed and we&apos;ll
            confirm in minutes.
          </>
        ),
      };
    }

    return {
      title: 'No match in the public court records yet.',
      body: (
        <>
          That could mean the property didn&apos;t go to auction, the sale
          didn&apos;t generate surplus, or the records haven&apos;t posted yet.
          Text us the address and we&apos;ll dig deeper by hand.
        </>
      ),
    };
  })();

  return (
    <div className="pass-root home-root" data-bg="flat" data-gold="full">
      <section className="pass-hero home-hero" data-loaded="1">
        <div className="pass-center home-center">
          {/* Brand block — Google-Maps-style pin with R, wordmark + tagline */}
          <div className="home-brand">
            <div className="home-brand-pin" aria-hidden="true">
              <svg viewBox="0 0 32 44" width="36" height="50" xmlns="http://www.w3.org/2000/svg">
                {/* Pin body: classic teardrop */}
                <path
                  d="M16 0C7.16 0 0 7.16 0 16c0 11.2 14.24 26.16 14.85 26.79a1.6 1.6 0 0 0 2.3 0C17.76 42.16 32 27.2 32 16 32 7.16 24.84 0 16 0z"
                  fill="var(--pass-gold)"
                />
                {/* Inner dark circle */}
                <circle cx="16" cy="16" r="9" fill="#0a0a0a" />
                {/* Letter R */}
                <text
                  x="16" y="20.4"
                  textAnchor="middle"
                  fontFamily="-apple-system, 'SF Pro Display', system-ui, sans-serif"
                  fontSize="13"
                  fontWeight="700"
                  fill="var(--pass-gold)"
                  letterSpacing="-0.02em"
                >R</text>
                {/* Subtle highlight for dimension */}
                <ellipse cx="11" cy="9" rx="4" ry="2.2" fill="rgba(255,255,255,0.18)" />
              </svg>
            </div>
            <div className="home-brand-name">RefundLocators</div>
            <div className="home-brand-tagline">Surplus fund intelligence · Ohio only</div>
          </div>

          <h1 className="home-headline">
            Lost a home in Ohio?{' '}
            <span className="home-headline-accent">
              The county may owe you money.
            </span>
          </h1>

          <p className="home-sub">
            When a foreclosure sells for more than the mortgage owed, the
            leftover — the <strong>surplus</strong> — belongs to you by law.
            We read every Ohio court record to find your case.
          </p>

          <form onSubmit={handleSearch} className="home-search" noValidate>
            <div className="home-search-field">
              <span className="home-search-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                ref={inputRef}
                className="home-search-input"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="2624 Maple Ave, Cincinnati, OH"
                autoComplete="street-address"
                inputMode="search"
                disabled={busy}
              />
            </div>

            <button
              type="submit"
              className="pass-cta-primary home-submit"
              disabled={busy || !address.trim()}
            >
              {busy ? (
                <span className="claim-spin" aria-hidden="true" />
              ) : (
                <>
                  <span>Check my address</span>
                  <span className="pass-arrow" aria-hidden="true">→</span>
                </>
              )}
            </button>

            {error && <div className="claim-err">{error}</div>}
          </form>

          {resultTile && (
            <div className="home-found">
              <span className="home-found-seal" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M7 11.5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <div className="home-found-title">{resultTile.title}</div>
                <div className="home-found-body">{resultTile.body}</div>
              </div>
            </div>
          )}

          <div className="home-or">or</div>

          {/* Lauren pitch — explain who she is in one tight beat, then the CTA */}
          <div className="home-lauren-pitch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="home-lauren-avatar"
              src="/s-assets/lauren-cropped.png"
              alt="Lauren"
              width={48}
              height={48}
            />
            <div className="home-lauren-copy">
              <div className="home-lauren-name">
                Meet Lauren · your AI surplus-funds agent
              </div>
              <div className="home-lauren-blurb">
                Trained on every Ohio foreclosure case, the Revised Code, and
                every county&apos;s procedure. Free, instant, and private.
              </div>
            </div>
          </div>

          <button
            type="button"
            className="pass-cta-secondary home-lauren-cta"
            onClick={() => setLaurenOpen(true)}
          >
            <span className="home-lauren-cta-dot" aria-hidden="true" />
            Chat with Lauren now
          </button>

          {recoveryTotal !== null && (
            <div className="home-trust">
              <strong>{fmtRecoveryTotal(recoveryTotal)}</strong> returned to{' '}
              <span className="home-buckeye" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                  {/* Single buckeye leaf — OSU helmet sticker style: pointed
                      almond shape, slightly serrated edge, deep green. */}
                  <defs>
                    <linearGradient id="bk-leaf-grad" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%"   stopColor="#5d8a3a" />
                      <stop offset="55%"  stopColor="#3d6e2c" />
                      <stop offset="100%" stopColor="#1f3e15" />
                    </linearGradient>
                  </defs>
                  {/* Leaf body: pointed top, rounded shoulders, narrow base */}
                  <path
                    d="M8 0.5
                       C 9.8 2.5, 11.5 5, 12 8.5
                       C 12.3 11, 11.2 13.5, 8 15.5
                       C 4.8 13.5, 3.7 11, 4 8.5
                       C 4.5 5, 6.2 2.5, 8 0.5 Z"
                    fill="url(#bk-leaf-grad)"
                  />
                  {/* Center vein */}
                  <path
                    d="M8 1.5 L 8 14.5"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                  />
                  {/* Side veins */}
                  <path d="M8 5.5 L 5.5 7"   stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" strokeLinecap="round" />
                  <path d="M8 5.5 L 10.5 7"  stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" strokeLinecap="round" />
                  <path d="M8 9 L 5 10.5"    stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" strokeLinecap="round" />
                  <path d="M8 9 L 11 10.5"   stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" strokeLinecap="round" />
                  {/* Small highlight at the top for dimension */}
                  <path
                    d="M7.5 2.5 C 8.4 3.2, 9 4.2, 9.4 5.4"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="0.4"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>{' '}
              Ohio homeowners
            </div>
          )}

          <div className="pass-legal home-legal">
            FundLocators LLC · Licensed Ohio attorney files · 25% of recovery · $0 upfront
            <br />
            <span className="home-human-fallback">
              Prefer a human? Text Nathan · <a href="sms:+15135162306">(513) 516-2306</a>
            </span>
          </div>
        </div>
      </section>

      <LaurenSheet open={laurenOpen} onClose={() => setLaurenOpen(false)} />
    </div>
  );
}
