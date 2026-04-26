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

import { useEffect, useRef, useState } from 'react';
import type { SearchResult } from '@/lib/supabase';

const PHONE_DISPLAY = '(513) 516-2306';
const PHONE_SMS = '+15135162306';

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
  const [recoveryTotal, setRecoveryTotal] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch real recovery total from /api/ticker — quietly drop if it fails or is 0
  useEffect(() => {
    let cancelled = false;
    fetch('/api/ticker')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (cancelled || !d) return;
        if (typeof d.total === 'number' && d.total > 0) setRecoveryTotal(d.total);
      })
      .catch(() => { /* silent — we have a fallback line */ });
    return () => { cancelled = true; };
  }, []);

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

  // SMS deep-link with the address pre-filled, so Nathan's incoming SMS
  // already has context — no "who is this?" ping-pong.
  const smsBody = encodeURIComponent(
    address.trim()
      ? `Hi Nathan — I lost a home in Ohio at ${address.trim()}. Was anything left over?`
      : `Hi Nathan — I lost a home in Ohio. Can you check if I'm owed surplus funds?`
  );

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
          {/* Brand block — gold radar mark + wordmark + tagline */}
          <div className="home-brand">
            <div className="home-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="9.5" strokeWidth="1" strokeDasharray="2.2 2.2" opacity="0.45" />
                <circle cx="12" cy="12" r="5.5" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="1.8" fill="#0a0a0a" stroke="none" />
                <line x1="12" y1="0.5" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23.5" />
                <line x1="0.5" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23.5" y2="12" />
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

          <a
            className="pass-cta-secondary home-sms"
            href={`sms:${PHONE_SMS}?&body=${smsBody}`}
          >
            Text Nathan · {PHONE_DISPLAY}
          </a>

          <div className="home-trust">
            <span className="home-availability-dot" aria-hidden="true" />
            <span>Usually replies in under 4 hours</span>
            {recoveryTotal !== null && (
              <>
                <span className="home-trust-sep" aria-hidden="true">·</span>
                <span><strong>{fmtRecoveryTotal(recoveryTotal)}</strong> returned to Ohio homeowners</span>
              </>
            )}
          </div>

          <div className="pass-legal home-legal">
            FundLocators LLC · Licensed Ohio attorney files · 25% of recovery · $0 upfront
          </div>
        </div>
      </section>
    </div>
  );
}
