'use client';

/**
 * CountyClient — landing surface for an individual Ohio county.
 *
 * Re-uses the homepage design system (.pass-root + home-* classes) but
 * adapts the headline + subhead to mention the specific county and its
 * county seat. Address search + Lauren chat live here too — same
 * components as the homepage, just contextualized.
 */

import { useEffect, useRef, useState } from 'react';
import LaurenSheet from '@/components/LaurenSheet';
import type { SearchResult } from '@/lib/supabase';

interface Props {
  countyName:       string;   // "Hamilton"
  countySeat:       string;   // "Cincinnati"
  clerkUrl:         string;   // verified clerk URL or Google search fallback
  hasVerifiedClerk: boolean;
}

export default function CountyClient({ countyName, countySeat, clerkUrl, hasVerifiedClerk }: Props) {
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<'rate_limit' | 'network' | ''>('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [laurenOpen, setLaurenOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || busy) return;
    setError(''); setBusy(true); setResult(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });
      if (res.status === 429) { setError('rate_limit'); return; }
      if (!res.ok)             { setError('network');    return; }
      const data: SearchResult = await res.json();
      if (!data || typeof data.status !== 'string') { setError('network'); return; }
      setResult(data);
    } catch {
      setError('network');
    } finally {
      setBusy(false);
    }
  };

  // Compose seed message for Lauren that includes the county context
  const laurenSeed = (() => {
    const addr = address.trim();
    if (error)         return addr ? `Your address-search system was down for me. I'm in ${countyName} County, OH — can you help me look up surplus funds for ${addr}?` : `I'm in ${countyName} County, OH and need help looking up surplus funds.`;
    if (!result)       return undefined;
    if (result.status === 'confirmed' || result.status === 'likely') return `I just searched ${addr} in ${countyName} County and your system found a match. Can you tell me about my case?`;
    if (result.status === 'needs_verification') return `I searched ${addr} in ${countyName} County and got partial matches. Can you help me figure out which case is mine?`;
    return `I searched ${addr} in ${countyName} County and got no match. Can you help me search differently?`;
  })();

  return (
    <div className="pass-root home-root" data-bg="flat" data-gold="full">
      <section className="pass-hero home-hero" data-loaded="1">
        <div className="pass-center home-center">
          <div className="home-brand">
            <div className="home-brand-pin" aria-hidden="true">
              <svg viewBox="0 0 32 44" width="36" height="50" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.16 0 0 7.16 0 16c0 11.2 14.24 26.16 14.85 26.79a1.6 1.6 0 0 0 2.3 0C17.76 42.16 32 27.2 32 16 32 7.16 24.84 0 16 0z" fill="var(--pass-gold)" />
                <circle cx="16" cy="16" r="9" fill="#0a0a0a" />
                <text x="16" y="20.4" textAnchor="middle" fontFamily="-apple-system, 'SF Pro Display', system-ui, sans-serif" fontSize="13" fontWeight="700" fill="var(--pass-gold)" letterSpacing="-0.02em">R</text>
                <ellipse cx="11" cy="9" rx="4" ry="2.2" fill="rgba(255,255,255,0.18)" />
              </svg>
            </div>
            <div className="home-brand-name">RefundLocators</div>
            <div className="home-brand-tagline">{countyName.toUpperCase()} COUNTY · OHIO</div>
          </div>

          <h1 className="home-headline">
            Lost a home in {countyName} County?{' '}
            <span className="home-headline-accent">
              The clerk in {countySeat} may owe you money.
            </span>
          </h1>

          <p className="home-sub">
            When a {countyName} County foreclosure sells for more than the mortgage owed,
            the leftover — the <strong>surplus</strong> — belongs to you by law. We read
            every {countyName} County court record to find your case.
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
                placeholder={`Your former ${countySeat} address`}
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
              {busy ? <span className="claim-spin" aria-hidden="true" />
                    : <><span>Check my address</span> <span className="pass-arrow" aria-hidden="true">→</span></>}
            </button>
          </form>

          {(result || error) && (
            <div className="home-found">
              <span className="home-found-seal" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M7 11.5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="home-found-content">
                <div className="home-found-title">
                  {error === 'rate_limit' && 'You’ve hit our search limit for now.'}
                  {error === 'network'    && 'The address search hiccupped.'}
                  {!error && result?.status === 'confirmed' && 'We found something on this address.'}
                  {!error && result?.status === 'likely'    && 'We found something on this address.'}
                  {!error && result?.status === 'needs_verification' && "Possible match — let's confirm yours."}
                  {!error && result?.status === 'no_match'  && 'No exact match yet — but Lauren can dig deeper.'}
                </div>
                <div className="home-found-body">
                  Lauren can take it from here. She knows {countyName} County&apos;s surplus
                  procedures inside out and can pull your case in seconds.
                </div>
                <button
                  type="button"
                  className="home-found-cta"
                  onClick={() => setLaurenOpen(true)}
                >
                  <span className="home-lauren-cta-dot" aria-hidden="true" />
                  Ask Lauren about my case →
                </button>
              </div>
            </div>
          )}

          <div className="home-or">or</div>

          <div className="home-lauren-pitch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="home-lauren-avatar" src="/s-assets/lauren-cropped.png"
                 alt="Lauren" width={48} height={48} />
            <div className="home-lauren-copy">
              <div className="home-lauren-name">
                Meet Lauren · {countyName} County surplus expert
              </div>
              <div className="home-lauren-blurb">
                Trained on every Ohio foreclosure case, the Revised Code, and {countyName}
                County&apos;s clerk procedures. Free, instant, and private.
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

          <div className="home-trust">
            <strong>$2.4M</strong> returned to{' '}
            <span style={{ display: 'inline-block', verticalAlign: '-3px', margin: '0 2px' }}>🌰</span>{' '}
            Ohio homeowners
          </div>

          <div className="pass-legal home-legal">
            FundLocators LLC · Licensed Ohio attorney files · 25% of recovery · $0 upfront
            <br />
            <span style={{ fontSize: 10.5, color: 'var(--pass-cream-45)' }}>
              {hasVerifiedClerk
                ? <>Verify your case at the <a href={clerkUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pass-gold)' }}>{countyName} County Clerk</a></>
                : <>Find the {countyName} County clerk: <a href={clerkUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pass-gold)' }}>search</a></>
              }
            </span>
          </div>
        </div>
      </section>

      <LaurenSheet open={laurenOpen} onClose={() => setLaurenOpen(false)} seed={laurenSeed} />
    </div>
  );
}
