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

// Format a recovery total — specific dollars win on trust over rounded
// aggregates ("$334,217" beats "$334k" beats "$2.4M" for this audience).
// Only round for amounts ≥$10M where digit-count would dominate the line.
function fmtRecoveryTotal(n: number): string {
  if (n >= 10_000_000) {
    const m = n / 1_000_000;
    return `$${Math.round(m)}M`;
  }
  return `$${n.toLocaleString('en-US')}`;
}

export default function HomeClient() {
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [laurenOpen, setLaurenOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Real, specific recovery total — Visionary/Florida Claim Solutions
  // research showed specific numbers ($64,527.46) outperform round
  // aggregates ($2.4M) on trust. Update as new claims close.
  const recoveryTotal: number = 334_217;
  const familyCount = 12;

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
        setError('rate_limit');
        return;
      }
      if (!res.ok) {
        // 400 / 500 — server didn't give us a SearchResult. Don't try to
        // render it; route to Lauren the same way a network failure does.
        setError('network');
        return;
      }

      const data: SearchResult = await res.json();
      // Defensive: if the JSON shape isn't what we expect, treat as error.
      if (!data || typeof data.status !== 'string') {
        setError('network');
        return;
      }
      setResult(data);
    } catch {
      setError('network');
    } finally {
      setBusy(false);
    }
  };

  // Result tile copy — keep it factual, never overpromise. Error states
  // route to Lauren too so we never leave the user at a dead-end.
  const resultTile = (() => {
    if (error === 'rate_limit') {
      return {
        title: 'You’ve hit our search limit for now.',
        body: (
          <>
            Lauren can pick up the search by hand — no rate limits, no waiting.
            Tell her your address and what you remember about the sale.
          </>
        ),
        cta: 'Ask Lauren instead',
      };
    }
    if (error === 'network') {
      return {
        title: 'The address search hiccupped.',
        body: (
          <>
            No problem — Lauren can take over from here. She works the public
            court records directly and can look up your case on the spot.
          </>
        ),
        cta: 'Ask Lauren instead',
      };
    }

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
            a sheriff&apos;s sale that may have left a surplus.{rangeStr} Ask
            Lauren below — she&apos;ll pull your case file and walk you through
            it.
          </>
        ),
        cta: 'Ask Lauren about my case',
      };
    }

    if (result.status === 'needs_verification') {
      return {
        title: "Possible match — let's confirm yours.",
        body: (
          <>
            The address turned up partial matches in Ohio court records. Lauren
            can ask a couple of follow-up questions — sale year, name on the
            deed, exact street formatting — and pin down your case.
          </>
        ),
        cta: 'Help me find my case',
      };
    }

    return {
      title: 'No exact match yet — but Lauren can dig deeper.',
      body: (
        <>
          That could mean the property hasn&apos;t posted to public records,
          the address needs reformatting, or the sale didn&apos;t leave a
          surplus. Lauren can run a wider search — different spellings,
          adjacent addresses, your name on prior deeds.
        </>
      ),
      cta: 'Have Lauren dig deeper',
    };
  })();

  // Build a context-aware seed message Lauren can run with
  const laurenSeed = (() => {
    const addr = address.trim();
    if (error) {
      return addr
        ? `Your address-search system was down for me. Can you help me look up surplus funds for ${addr}?`
        : undefined;
    }
    if (!result) return undefined;
    if (result.status === 'confirmed' || result.status === 'likely') {
      return `I just searched my address — ${addr} — and your system found a match. Can you tell me about my case?`;
    }
    if (result.status === 'needs_verification') {
      return `I searched ${addr} and got partial matches. Can you help me figure out which case is mine?`;
    }
    return `I searched ${addr} and got no match. Can you help me search differently — maybe by my name or a previous spelling of the address?`;
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

            {/* Errors render inside the result tile below — no dead-end strings. */}
          </form>

          {resultTile && (
            <div className="home-found">
              <span className="home-found-seal" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M7 11.5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="home-found-content">
                <div className="home-found-title">{resultTile.title}</div>
                <div className="home-found-body">{resultTile.body}</div>
                <button
                  type="button"
                  className="home-found-cta"
                  onClick={() => setLaurenOpen(true)}
                >
                  <span className="home-lauren-cta-dot" aria-hidden="true" />
                  {resultTile.cta} →
                </button>
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
                {/* Classic Ohio buckeye composition: brown nut with cream eye
                    on the left, palmate green leaf with 5 leaflets fanning up
                    on the right. No sticker outline. */}
                <svg viewBox="0 0 24 16" width="28" height="19" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="bk-nut-body" cx="38%" cy="32%" r="80%">
                      <stop offset="0%"   stopColor="#9a5530" />
                      <stop offset="55%"  stopColor="#5e2f19" />
                      <stop offset="100%" stopColor="#371b0e" />
                    </radialGradient>
                    <radialGradient id="bk-nut-eye" cx="48%" cy="40%" r="65%">
                      <stop offset="0%"   stopColor="#f4e3c1" />
                      <stop offset="100%" stopColor="#cdae80" />
                    </radialGradient>
                    <linearGradient id="bk-leaf-fill" x1="50%" y1="100%" x2="50%" y2="0%">
                      <stop offset="0%"   stopColor="#1f3e15" />
                      <stop offset="55%"  stopColor="#3d6e2c" />
                      <stop offset="100%" stopColor="#6a9a40" />
                    </linearGradient>
                  </defs>

                  {/* Nut — lower-left, partially behind the leaf cluster */}
                  <g transform="translate(5.5 10.2)">
                    <circle r="4.6" fill="url(#bk-nut-body)" />
                    <ellipse cx="0.2" cy="1.1" rx="2.7" ry="2.3" fill="url(#bk-nut-eye)" />
                    {/* highlight */}
                    <ellipse cx="-2" cy="-2.2" rx="1.5" ry="0.8" fill="rgba(255,255,255,0.22)" />
                  </g>

                  {/* Leaf cluster — 5 leaflets fanning up from a center point on the right */}
                  <g transform="translate(15 12)">
                    {[-75, -37.5, 0, 37.5, 75].map((angle, i) => (
                      <g key={i} transform={`rotate(${angle})`}>
                        <path
                          d="M0 0 C -1 -2, -1 -5, 0 -8 C 1 -5, 1 -2, 0 0 Z"
                          fill="url(#bk-leaf-fill)"
                        />
                        <path
                          d="M0 -0.5 L 0 -7.4"
                          stroke="rgba(255,255,255,0.26)"
                          strokeWidth="0.32"
                          strokeLinecap="round"
                        />
                      </g>
                    ))}
                    {/* small dark center node where leaflets meet */}
                    <circle cx="0" cy="0" r="0.65" fill="#2c5018" />
                  </g>
                </svg>
              </span>{' '}
              {familyCount} Ohio families
            </div>
          )}

          <div className="pass-legal home-legal">
            FundLocators LLC · Licensed Ohio attorney files · 25% of recovery · $0 upfront
            <br />
            <span style={{ fontSize: 10.5, color: 'var(--pass-cream-45)' }}>
              <a href="/is-this-legit" style={{ color: 'var(--pass-gold)', textDecoration: 'none' }}>
                Is this a scam? →
              </a>
              {' · '}
              <a href="/story" style={{ color: 'var(--pass-gold)', textDecoration: 'none' }}>
                Why Nathan built this →
              </a>
            </span>
          </div>
        </div>
      </section>

      <LaurenSheet
        open={laurenOpen}
        onClose={() => setLaurenOpen(false)}
        seed={laurenSeed}
      />
    </div>
  );
}
