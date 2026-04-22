'use client';

import { useState, useRef, useEffect } from 'react';
import type { SearchResult, ForeclosureCase } from '@/lib/supabase';

const SEARCH_STEPS = [
  'Checking Ohio sheriff sale records…',
  'Searching statewide surplus fund filings…',
  'Matching against attorney-filed cases…',
  'Cross-referencing Clerk of Courts holdings…',
];

function fmt(n: number) {
  return '$' + n.toLocaleString();
}

function ResultConfirmed({ result, onClaim, onChat }: {
  result: SearchResult;
  onClaim: () => void;
  onChat: () => void;
}) {
  const fc = result.case as ForeclosureCase;
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>✓</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--cream)' }}>We found it.</span>
      </div>
      <div style={{
        border: '1px solid rgba(201,162,74,.35)', borderRadius: 6,
        padding: '20px 22px', marginBottom: 20, background: 'rgba(201,162,74,.05)',
      }}>
        <Row label="Property" value={fc.property_address} />
        <Row label="County" value={fc.county} />
        {fc.defendant_names?.[0] && (
          <Row label="Former owner" value={`${fc.defendant_names[0]} (confirm this is you)`} muted />
        )}
        {result.estimated_surplus && (
          <Row label="Amount held" value={fmt(result.estimated_surplus.low)} highlight />
        )}
        {fc.sale_date && <Row label="Filed" value={fc.sale_date} />}
        <Row label="Status" value="Unclaimed" highlight />
      </div>
      <p style={{ fontSize: 14, color: 'var(--cream-45)', marginBottom: 20, lineHeight: 1.6 }}>
        You have a statutory right to claim this money. Our attorneys handle the legal filing on your behalf for 20% of recovered funds. Zero upfront cost.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onClaim} style={btnPrimary}>That's my property — help me claim it →</button>
        <button onClick={onChat} style={btnSecondary}>I have questions first</button>
      </div>
    </div>
  );
}

function ResultLikely({ result, onClaim, onChat }: {
  result: SearchResult;
  onClaim: () => void;
  onChat: () => void;
}) {
  const fc = result.case as ForeclosureCase;
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>◐</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--cream)' }}>
          There's a very good chance you have surplus waiting.
        </span>
      </div>
      <div style={{
        border: '1px solid var(--border)', borderRadius: 6,
        padding: '20px 22px', marginBottom: 20, background: 'rgba(255,255,255,.03)',
      }}>
        <Row label="Property" value={fc.property_address} />
        {fc.sale_date && <Row label="Sale date" value={fc.sale_date} />}
        {fc.sale_price && <Row label="Sale price" value={fmt(fc.sale_price)} />}
        {fc.judgment_amount && <Row label="Known debt" value={`${fmt(fc.judgment_amount)} (from court records)`} />}
        {result.estimated_surplus && (
          <Row
            label="Estimated surplus"
            value={`~${fmt(result.estimated_surplus.low)} – ${fmt(result.estimated_surplus.high)}`}
            highlight
          />
        )}
      </div>
      <p style={{ fontSize: 14, color: 'var(--cream-45)', marginBottom: 20, lineHeight: 1.6 }}>
        The money typically sits with the county Clerk of Courts for 5 years after the sale. If nobody claims it, it escheats to the state. Our attorney files the motion — we cover the filing fees. You pay 20% only if we recover.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onClaim} style={btnPrimary}>Help me claim this surplus →</button>
        <button onClick={onChat} style={btnSecondary}>I have questions — chat with Lauren</button>
      </div>
    </div>
  );
}

function ResultNeedsVerification({ result, address }: { result: SearchResult; address: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(process.env.NEXT_PUBLIC_SUBMIT_LEAD_URL || '/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone,
          property_address: address,
          county: result.county,
          source: 'homepage_search',
          urgency: 'normal',
        }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ marginTop: 32 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--cream)', marginBottom: 8 }}>
          Got it. We're on it.
        </p>
        <p style={{ fontSize: 14, color: 'var(--cream-45)', lineHeight: 1.6 }}>
          We'll pull {result.county ? `${result.county} County` : 'your county'}'s records by hand and text you back within 24 hours. No charge either way.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>○</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--cream)' }}>
          We need to pull your county's records by hand.
        </span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--cream-45)', marginBottom: 20, lineHeight: 1.6 }}>
        {result.county
          ? `${result.county} County isn't in our live data feed yet.`
          : `Your county isn't in our live data feed yet.`}{' '}
        We'll verify manually and text you back within 24 hours. Still free — we don't charge unless we recover.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Your name" required
          style={inputStyle}
        />
        <input
          value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="Phone (text only, no calls unless you ask)"
          type="tel" required
          style={inputStyle}
        />
        <input
          value={address} readOnly
          style={{ ...inputStyle, opacity: 0.6 }}
        />
        <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: 4 }}>
          {loading ? 'Sending…' : 'Check my case →'}
        </button>
      </form>
    </div>
  );
}

function ResultNoMatch({ onChat, onRetry }: { onChat: () => void; onRetry: () => void }) {
  return (
    <div style={{ marginTop: 32 }}>
      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--cream)', marginBottom: 12 }}>
        We don't see a surplus fund situation on this property.
      </p>
      <p style={{ fontSize: 14, color: 'var(--cream-45)', marginBottom: 16, lineHeight: 1.6 }}>
        That could mean the property didn't go to auction, the sale didn't generate surplus, the records haven't posted yet, or the address didn't quite match.
      </p>
      <p style={{ fontSize: 14, color: 'var(--cream-45)', marginBottom: 20, lineHeight: 1.6 }}>
        If something recently changed with this property — or if the home is still in trouble — Lauren can walk through your options.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onChat} style={btnPrimary}>Ask Lauren →</button>
        <button onClick={onRetry} style={btnSecondary}>Search another address</button>
      </div>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function Row({ label, value, highlight, muted }: {
  label: string; value: string; highlight?: boolean; muted?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 14 }}>
      <span style={{ color: 'var(--cream-45)', minWidth: 130, flexShrink: 0 }}>{label}</span>
      <span style={{
        color: highlight ? 'var(--gold)' : muted ? 'var(--cream-45)' : 'var(--cream)',
        fontWeight: highlight ? 600 : 400,
      }}>{value}</span>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  background: 'var(--gold)', color: 'var(--bg)',
  border: 'none', borderRadius: 4,
  padding: '13px 22px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', boxShadow: 'var(--shadow-gold)',
  fontFamily: 'var(--font)',
};

const btnSecondary: React.CSSProperties = {
  background: 'transparent', color: 'var(--cream-70)',
  border: '1px solid var(--border)', borderRadius: 4,
  padding: '13px 22px', fontSize: 14, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'var(--font)',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  border: '1px solid var(--border)', borderRadius: 4,
  font: '15px var(--font)', color: 'var(--cream)',
  background: 'rgba(255,255,255,.04)', outline: 'none',
  boxSizing: 'border-box',
};

// ── Main component ───────────────────────────────────────────────────────────

export default function HeroSearch({ onChatOpen }: { onChatOpen: () => void }) {
  const [address, setAddress] = useState('');
  const [phase, setPhase] = useState<'idle' | 'searching' | 'result'>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>([false, false, false, false]);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Animate search steps
  useEffect(() => {
    if (phase !== 'searching') return;
    setStepIdx(0);
    setCheckedSteps([false, false, false, false]);

    const timers: ReturnType<typeof setTimeout>[] = [];
    SEARCH_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStepIdx(i), i * 900));
      timers.push(setTimeout(() => {
        setCheckedSteps(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 900 + 600));
    });

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setError('');
    setPhase('searching');

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      // Wait for animation to finish (minimum 4s feel)
      await new Promise(r => setTimeout(r, 3800));

      if (res.status === 429) {
        setError('Too many searches. Please try again in an hour or chat with Lauren directly.');
        setPhase('idle');
        return;
      }

      const data: SearchResult = await res.json();
      setResult(data);
      setPhase('result');
    } catch {
      setError('Something went wrong. Please try again or chat with Lauren.');
      setPhase('idle');
    }
  };

  const handleRetry = () => {
    setPhase('idle');
    setResult(null);
    setAddress('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div style={{ maxWidth: 640, width: '100%' }}>
      {/* Search form — always visible */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, position: 'relative' }}>
        <input
          ref={inputRef}
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="123 Main St, Cincinnati, OH 45202"
          disabled={phase === 'searching'}
          style={{
            flex: 1, padding: '16px 18px',
            border: '1px solid var(--border-g)', borderRight: 'none',
            borderRadius: '4px 0 0 4px',
            font: '16px var(--font)', color: 'var(--cream)',
            background: 'rgba(255,255,255,.06)', outline: 'none',
            opacity: phase === 'searching' ? 0.6 : 1,
          }}
        />
        <button
          type="submit"
          disabled={phase === 'searching' || !address.trim()}
          style={{
            padding: '16px 24px',
            background: phase === 'searching' ? 'rgba(201,162,74,.5)' : 'var(--gold)',
            color: 'var(--bg)', border: 'none',
            borderRadius: '0 4px 4px 0',
            font: '700 16px var(--font)', cursor: phase === 'searching' ? 'not-allowed' : 'pointer',
            transition: 'background .15s',
            flexShrink: 0,
          }}
        >
          {phase === 'searching' ? '…' : '→'}
        </button>
      </form>

      {error && (
        <p style={{ marginTop: 12, fontSize: 13, color: '#fca5a5' }}>{error}</p>
      )}

      <p style={{ fontSize: 12, color: 'var(--cream-20)', marginTop: 10 }}>
        Free · No account · No spam · Anonymous until you decide otherwise.
      </p>

      {/* Searching animation */}
      {phase === 'searching' && (
        <div style={{ marginTop: 28 }}>
          {SEARCH_STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 10, fontSize: 13,
                opacity: i <= stepIdx ? 1 : 0.2,
                transition: 'opacity .3s',
                color: checkedSteps[i] ? 'var(--cream-45)' : 'var(--cream-70)',
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                border: checkedSteps[i] ? 'none' : '1.5px solid var(--gold)',
                background: checkedSteps[i] ? 'var(--gold)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: 'var(--bg)', flexShrink: 0,
                transition: 'all .3s',
              }}>
                {checkedSteps[i] ? '✓' : ''}
              </span>
              {step}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {phase === 'result' && result && (
        <>
          {result.status === 'confirmed' && (
            <ResultConfirmed result={result} onClaim={onChatOpen} onChat={onChatOpen} />
          )}
          {result.status === 'likely' && (
            <ResultLikely result={result} onClaim={onChatOpen} onChat={onChatOpen} />
          )}
          {result.status === 'needs_verification' && (
            <ResultNeedsVerification result={result} address={address} />
          )}
          {result.status === 'no_match' && (
            <ResultNoMatch onChat={onChatOpen} onRetry={handleRetry} />
          )}
        </>
      )}
    </div>
  );
}
