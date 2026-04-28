'use client';

/**
 * PersonalizedClient — the /s/[token] pass surface.
 *
 * Ported from the design hand-off (Ship.html + pass.jsx + modal.jsx + lauren-ai.jsx).
 * One file, three sections: <PassHero />, <CaseCard />, <FAQ />, plus
 * <ClaimModal /> and <LaurenAISheet /> overlays.
 *
 * Token data comes from the server (page.tsx → personalized_links row),
 * mapped into the shape the design expects.
 */

import { useEffect, useRef, useState } from 'react';
import type { PersonalizedLink } from '@/lib/supabase';
import { CONFIG } from '@/lib/config';

// ── Types ────────────────────────────────────────────────────────────────────

interface TokenView {
  token: string;
  firstName: string;
  lastName: string;
  propertyAddress: string;
  city: string;
  zip: string;
  county: string;
  caseNumber: string;
  saleDate: string;
  salePrice: number;
  judgmentAmount: number;
  estimatedLow: number;
  estimatedHigh: number;
  estimatedMidpoint: number;
  confirmed: boolean;
  confirmedAmount: number | null;
}

// ── Formatters ───────────────────────────────────────────────────────────────

const fmtDollar = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const fmtRounded = (n: number) => {
  const rounded = Math.round(n / 1000) * 1000;
  return '$' + rounded.toLocaleString('en-US');
};
const fmtK = (n: number) => '$' + Math.round(n / 1000) + 'k';

function formatSaleDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── DB row → view-model mapper ───────────────────────────────────────────────

function mapLinkToToken(link: PersonalizedLink): TokenView {
  // Best-effort city/zip extraction (e.g. "2624 Maple Ave, Cincinnati, OH 45211")
  let street = link.property_address || '';
  let city = '';
  let zip = '';
  if (link.property_address) {
    const parts = link.property_address.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      street = parts[0];
      city = parts[1] || '';
      const last = parts[parts.length - 1] || '';
      const zipMatch = last.match(/\b(\d{5})\b/);
      if (zipMatch) zip = zipMatch[1];
    }
  }

  const low = link.estimated_surplus_low ?? 0;
  const high = link.estimated_surplus_high ?? 0;
  const mid = low && high ? Math.round((low + high) / 2) : (low || high || 0);

  return {
    token: link.token,
    firstName: link.first_name || '',
    lastName: link.last_name || '',
    propertyAddress: street,
    city,
    zip,
    county: link.county || '',
    caseNumber: link.case_number || '',
    saleDate: formatSaleDate(link.sale_date),
    salePrice: link.sale_price ?? 0,
    judgmentAmount: link.judgment_amount ?? 0,
    estimatedLow: low,
    estimatedHigh: high,
    estimatedMidpoint: mid,
    confirmed: false,
    confirmedAmount: null,
  };
}

// ── Hero count-up amount ─────────────────────────────────────────────────────

function HeroAmount({
  value, durationMs = 1400, style,
}: { value: string; durationMs?: number; style?: React.CSSProperties }) {
  const numeric = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  const step = numeric >= 100000 ? 1000 : numeric >= 10000 ? 500 : 100;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (numeric <= 0) { setShown(0); return; }
    setShown(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const raw = numeric * eased;
      const snapped = Math.min(numeric, Math.round(raw / step) * step);
      setShown(snapped);
      if (t >= 1) clearInterval(interval);
    }, 24);
    return () => clearInterval(interval);
  }, [numeric, durationMs, step]);

  const done = shown >= numeric;
  return (
    <span
      className={`hero-amount ${done ? 'done' : 'spinning'}`}
      style={style}
      aria-label={value}
    >
      ${shown.toLocaleString('en-US')}
    </span>
  );
}

// ── Receipt-row count-up ─────────────────────────────────────────────────────

function CountUp({
  value, prefix = '$', sign = '', durationMs = 700, delay = 0,
}: { value: number; prefix?: string; sign?: string; durationMs?: number; delay?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      if (now < start) { raf = requestAnimationFrame(tick); return; }
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs, delay]);
  return <span>{sign}{prefix}{shown.toLocaleString('en-US')}</span>;
}

// ── Hero background (Google Street View of the property) ───────────────────
//
// Per Nathan's call 2026-04-28: instead of a small thumbnail of the property,
// fill the entire hero with the Street View image — heavily blurred and
// darkened — so the lead's name + amount + CTAs sit on top of a photo of
// their actual house. Atmospheric, not literal: the eye recognizes "my place"
// without losing readability of the gold-on-cream type.
//
// Falls back silently if the Maps API key isn't set or there's no imagery
// (the route returns 404 and we just keep the dark background).
function HeroBackground({ address }: { address: string }) {
  const [ok, setOk] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const src = `/api/streetview?address=${encodeURIComponent(address)}&w=640&h=400`;

  // If the browser cached the image and it's already complete by the time
  // React attaches the onLoad listener, the event never fires and the
  // background stays at opacity 0 forever. Re-check on mount via the ref.
  useEffect(() => {
    if (imgRef.current?.complete && (imgRef.current.naturalWidth || 0) > 0) {
      setOk(true);
    }
  }, []);

  return (
    <div className="pass-hero-bg" data-state={ok ? 'ok' : 'pending'} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        onLoad={() => setOk(true)}
        onError={() => setOk(false)}
        loading="eager"
        decoding="async"
      />
      <div className="pass-hero-bg-overlay" />
    </div>
  );
}

// ── Pass hero (first screen) ─────────────────────────────────────────────────

function PassHero({
  token, onStartClaim, onTalkToLauren,
}: {
  token: TokenView;
  onStartClaim: () => void;
  onTalkToLauren: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [rangeLoaded, setRangeLoaded] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 60);
    const t2 = setTimeout(() => setRangeLoaded(true), 460);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const amount = token.confirmed ? (token.confirmedAmount ?? 0) : token.estimatedMidpoint;
  const displayAmount = fmtRounded(amount);
  const charCount = displayAmount.length;
  const numberFontSize =
    charCount >= 10 ? 64 :
    charCount >= 9  ? 72 :
    charCount >= 8  ? 80 :
    charCount >= 7  ? 88 :
                      96;

  // CTA copy: "File for my $X". Per Nathan 2026-04-28 — pairs with the
  // explanatory line above ("That extra money belongs to you, held by
  // the County Clerk") to make the action feel concrete: you're filing
  // for money the court is already holding, not asking a stranger for cash.
  const ctaCopy = `File for my ${displayAmount}`;

  const numberStyle: React.CSSProperties = {
    fontFamily: 'var(--pass-serif)',
    fontWeight: 400,
    fontStyle: 'normal',
    letterSpacing: '-0.035em',
    fontSize: numberFontSize + 'px',
  };

  const fullName = [token.firstName, token.lastName].filter(Boolean).join(' ').toUpperCase();
  const addressLine = token.city
    ? `${token.propertyAddress} · ${token.city}, OH ${token.zip || ''}`.trim()
    : `${token.propertyAddress} · ${token.county} County OH`;

  const photoAddress = token.city
    ? `${token.propertyAddress}, ${token.city}, OH ${token.zip || ''}`.trim()
    : `${token.propertyAddress}, ${token.county} County, OH`;

  return (
    <div className="pass-hero" data-loaded={loaded ? '1' : '0'}>
      {/* Street View of the property, blurred + darkened. Sits behind the
          rest of the hero. Falls back to plain background if no imagery. */}
      <HeroBackground address={photoAddress} />

      <header className="pass-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/s-assets/logo-mark.svg" alt="" width={32} height={32} />
        <span className="pass-top-domain">refundlocators.com</span>
      </header>

      <div className="pass-recipient">
        {fullName && <div className="pass-recipient-name">{fullName}</div>}
        <div className="pass-recipient-addr">{addressLine}</div>
      </div>

      <div className="pass-context">
        Your home was recently sold at a sheriff&apos;s sale. We believe it sold for{' '}
        <strong>more than what you owed</strong> — and that extra money belongs to you,
        held by the {token.county} County Clerk.
      </div>

      <div className="pass-center">
        <div className="pass-number-wrap">
          <div className="pass-number" style={numberStyle}>
            <HeroAmount value={displayAmount} durationMs={1400} />
          </div>
          <div className={`pass-confidence ${token.confirmed ? 'confirmed' : ''}`}>
            {token.confirmed ? 'confirmed by the court' : 'estimated surplus'}
          </div>
          {!token.confirmed && (
            <div className={`pass-range ${rangeLoaded ? 'in' : ''}`}>
              Range {fmtK(token.estimatedLow)}–{fmtK(token.estimatedHigh)} · public court records
            </div>
          )}
          {token.confirmed && (
            <div className={`pass-range ${rangeLoaded ? 'in' : ''}`}>
              Held by {token.county} County Clerk · public court records
            </div>
          )}
        </div>

        <div className="pass-actions">
          <button type="button" className="pass-cta-primary" onClick={onStartClaim}>
            <span>{ctaCopy}</span>
            <span className="pass-arrow" aria-hidden="true">→</span>
          </button>
          <button type="button" className="pass-cta-secondary" onClick={onTalkToLauren}>
            Ask Lauren a question
          </button>
        </div>

        <div className="pass-legal">
          Filed by a licensed Ohio attorney
          <br />
          25% of recovery · $0 upfront
        </div>
      </div>

      <div className="pass-scroll-hint" aria-hidden="true">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ── Why we reach out (empathy + advocacy beat after the hero) ────────────────
//
// Per Nathan 2026-04-28: the hero alone reads transactional ("you have
// money waiting"). For people who just lost their home, that lands cold.
// This section sits between hero and the case receipt to acknowledge the
// difficulty and explain why the county didn't tell them — the surplus
// system is intentionally hard to navigate, and many families lose what
// is rightfully theirs simply because no one told them.
function WhyWeReachOut({ county }: { county: string }) {
  return (
    <section className="pass-section pass-empathy-section">
      <div className="pass-section-eyebrow">WHY YOU&apos;RE HEARING FROM US</div>
      <div className="pass-empathy-body">
        <p>Losing a home is hard. We know that, and we don&apos;t take it lightly.</p>
        <p>
          Here&apos;s what most people aren&apos;t told: when a home sells for more than
          the debt, the leftover money — the surplus — sits at the {county}
          {' '}County Clerk&apos;s office. The county is required to send only one
          certified letter, usually to the foreclosed address the family no
          longer lives at.
        </p>
        <p>
          If no one claims it within the window, the money quietly stays with the
          county. Many families lose what&apos;s rightfully theirs simply because they
          were never told.
        </p>
        <p className="pass-empathy-close">
          That&apos;s why we read the public court records and reach out directly —
          to make sure you know, and to make it as easy as one click for you to
          get it.
        </p>
      </div>
    </section>
  );
}

// ── Case card (second screen) ────────────────────────────────────────────────

function CaseCard({ token }: { token: TokenView }) {
  const surplusMid = token.confirmed ? (token.confirmedAmount ?? 0) : token.estimatedMidpoint;
  const fees = Math.max(2000, Math.round((token.salePrice - token.judgmentAmount - surplusMid) / 100) * 100);

  const rows: Array<[string, string, { num: number; sign: string } | null]> = [
    ['Case number',     token.caseNumber, null],
    ['Sale date',       token.saleDate, null],
    ['Sale price',      fmtDollar(token.salePrice), { num: token.salePrice, sign: '' }],
    ['Judgment debt',   '−' + fmtDollar(token.judgmentAmount), { num: token.judgmentAmount, sign: '−' }],
    ['Fees & costs',    '−' + fmtDollar(fees), { num: fees, sign: '−' }],
    [
      token.confirmed ? 'Confirmed surplus' : 'Estimated surplus',
      token.confirmed
        ? fmtDollar(token.confirmedAmount ?? 0)
        : `${fmtK(token.estimatedLow)}–${fmtK(token.estimatedHigh)}`,
      token.confirmed ? { num: token.confirmedAmount ?? 0, sign: '' } : null,
    ],
  ];

  const smsBody = encodeURIComponent(
    `Hi Lauren, this is ${[token.firstName, token.lastName].filter(Boolean).join(' ').trim() || 'someone tapping the link'}. I tapped the link about ${token.propertyAddress}.`
  );

  return (
    <section className="pass-section pass-case-section">
      <div className="pass-section-eyebrow">YOUR CASE ON FILE</div>

      <div className="cc-receipt">
        <div className="cc-receipt-head">
          <div className="cc-receipt-title">Sheriff&apos;s sale · {token.county} County</div>
          <div className="cc-receipt-sub">Court of Common Pleas</div>
        </div>
        <div className="cc-receipt-perf" aria-hidden="true" />
        <div className="cc-receipt-rows">
          {rows.map(([k, v, anim], i) => (
            <div
              key={k}
              className={`cc-receipt-row ${i === rows.length - 1 ? 'total' : ''}`}
              style={{ animationDelay: (120 + i * 90) + 'ms' }}
            >
              <span className="cc-receipt-k">{k}</span>
              <span className="cc-receipt-dot" aria-hidden="true" />
              <span className="cc-receipt-v">
                {anim
                  ? <CountUp value={anim.num} sign={anim.sign} durationMs={650} delay={120 + i * 90} />
                  : v}
              </span>
            </div>
          ))}
        </div>
        <div className="cc-receipt-foot">
          Filed by a licensed Ohio attorney · public court record
        </div>
      </div>

      <a className="pass-nathan" href={`sms:+15135162306?&body=${smsBody}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="pass-nathan-avatar pass-nathan-avatar-img"
          src="/s-assets/lauren-cropped.png"
          alt="Lauren"
          width={48}
          height={48}
        />
        <div className="pass-nathan-text">
          <div className="pass-nathan-name">Talk with Lauren</div>
          <div className="pass-nathan-sub">Your surplus case agent · tap to text</div>
        </div>
        <div className="pass-nathan-chevron" aria-hidden="true">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
            <path d="M2 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </a>
    </section>
  );
}

// ── FAQ (third screen) ───────────────────────────────────────────────────────

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'Is this a scam?',
    a: `No. We are a private Ohio company working with a licensed Ohio attorney. The surplus amount shown above comes from public county court records — you can verify it yourself at the {county} County Clerk of Courts website. We only make money if you get paid.`,
  },
  {
    q: 'How do you know about my case?',
    a: `Every sheriff's sale in Ohio produces a public court record. When a home sells for more than the mortgage debt plus fees, the extra money — the surplus — sits with the county clerk. We read those records and text the former homeowner.`,
  },
  {
    q: `What's the fee?`,
    a: `Twenty-five percent of what we recover for you. Zero upfront. If the court releases $0, you owe $0. The fee, the process, and your right to cancel are all spelled out in the one-page agreement you'll sign.`,
  },
  {
    q: 'Are you attorneys?',
    a: `RefundLocators is not a law firm. A licensed Ohio attorney on our team handles the court filing. We can share their bar credentials directly if you ask.`,
  },
  {
    q: 'How long does it take?',
    a: `The attorney files within 7 business days of your signed agreement. After that, most Ohio counties release funds in 30–90 days. We text you at every stage. No chasing, no phone trees.`,
  },
  {
    q: 'Prefer to talk to a person?',
    a: `Of course. Text our team at (513) 516-2306 and a real person will get back to you. Otherwise the AI agent above can answer most questions about your case at {address} 24/7.`,
  },
];

function FAQ({ token }: { token: TokenView }) {
  const [openIdx, setOpenIdx] = useState(-1);
  return (
    <section className="pass-section pass-faq-section">
      <div className="pass-section-eyebrow">QUESTIONS</div>
      <div className="pass-faq">
        {FAQS.map((faq, i) => {
          const isOpen = openIdx === i;
          const answer = faq.a
            .replace('{county}', token.county || 'your')
            .replace('{address}', token.propertyAddress);
          return (
            <button
              key={i}
              type="button"
              className="pass-faq-item"
              data-open={isOpen ? '1' : '0'}
              onClick={() => setOpenIdx(isOpen ? -1 : i)}
            >
              <div className="pass-faq-q">
                <span>{faq.q}</span>
                <span className="pass-faq-plus" aria-hidden="true">+</span>
              </div>
              <div className="pass-faq-a-wrap">
                <div className="pass-faq-a">{answer}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pass-footer">
        <div className="pass-footer-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/s-assets/logo-mark.svg" alt="" width={16} height={16} />
          <span>RefundLocators · an Ohio company</span>
        </div>
        <div className="pass-footer-legal">
          FundLocators LLC. Not a government service. Not a law firm. We partner with
          a licensed Ohio attorney to file your surplus claim.
        </div>
      </div>
    </section>
  );
}

// ── Claim modal ──────────────────────────────────────────────────────────────

function ClaimModal({
  open, onClose, token,
}: { open: boolean; onClose: () => void; token: TokenView }) {
  const [stage, setStage] = useState<'form' | 'submitting' | 'done'>('form');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; address?: string; phone?: string }>({});
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStage('form');
      const fullName = [token.firstName, token.lastName].filter(Boolean).join(' ');
      setName(fullName);
      setAddress(`${token.propertyAddress}${token.county ? `, ${token.county} OH` : ''}`);
      setPhone('');
      setErrors({});
      const t = setTimeout(() => firstFieldRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [open, token]);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = 'Please enter your full name';
    if (address.trim().length < 6) errs.address = 'Please enter your mailing address';
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) errs.phone = 'Please enter a 10-digit mobile number';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStage('submitting');
    try {
      // visitor_id lets the server flag any in-progress Lauren conversation
      // from this same browser as having converted to a claim.
      let visitorId: string | null = null;
      try { visitorId = localStorage.getItem('lauren_visitor_id'); } catch { /* private mode */ }

      await fetch('/api/s/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token: token.token,
          name: name.trim(),
          address: address.trim(),
          phone: digits,
          visitor_id: visitorId,
        }),
      });
    } catch {
      // best-effort — show success regardless
    }
    setStage('done');
  };

  if (!open) return null;

  const claimReference = `RFL-${(token.caseNumber || token.token).replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

  return (
    <div className="claim-scrim" role="dialog" aria-modal="true" aria-label="Start my claim">
      <div className="claim-modal">
        {stage !== 'done' && (
          <>
            <div className="claim-header">
              <button type="button" className="claim-close" onClick={onClose} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <div className="claim-header-title">Start my claim</div>
              <div className="claim-header-spacer" />
            </div>

            <div className="claim-body">
              <div className="claim-intro">
                <div className="claim-intro-k">For</div>
                <div className="claim-intro-v">{token.propertyAddress}</div>
                <div className="claim-intro-amt">
                  {token.confirmed ? 'Confirmed ' : 'Estimated '}
                  <strong>{fmtRounded(token.confirmed ? (token.confirmedAmount ?? 0) : token.estimatedMidpoint)}</strong>
                </div>
              </div>

              <form onSubmit={onSubmit} className="claim-form" noValidate>
                <label className="claim-field">
                  <span className="claim-field-label">Your full name</span>
                  <input
                    ref={firstFieldRef}
                    type="text"
                    className="claim-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First and last"
                    autoComplete="name"
                    data-error={errors.name ? '1' : '0'}
                  />
                  {errors.name && <span className="claim-err">{errors.name}</span>}
                </label>

                <label className="claim-field">
                  <span className="claim-field-label">
                    Mailing address
                    <span className="claim-field-hint">pre-filled from records · editable</span>
                  </span>
                  <input
                    type="text"
                    className="claim-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                    data-error={errors.address ? '1' : '0'}
                  />
                  {errors.address && <span className="claim-err">{errors.address}</span>}
                </label>

                <label className="claim-field">
                  <span className="claim-field-label">Mobile number</span>
                  <input
                    type="tel"
                    className="claim-input"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(555) 123-4567"
                    autoComplete="tel"
                    inputMode="tel"
                    data-error={errors.phone ? '1' : '0'}
                  />
                  {errors.phone && <span className="claim-err">{errors.phone}</span>}
                </label>

                <button type="submit" className="claim-submit" disabled={stage === 'submitting'}>
                  {stage === 'submitting' ? (
                    <span className="claim-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <span>Send to Lauren</span>
                      <span className="pass-arrow">→</span>
                    </>
                  )}
                </button>

                <div className="claim-privacy">
                  No email. No account. No password.
                  <br />Lauren, your case agent, texts you back — usually in under 4 hours.
                </div>
              </form>
            </div>
          </>
        )}

        {stage === 'done' && (
          <div className="claim-done">
            <div className="claim-done-seal" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.25" />
                <path d="M13 20.5l5 5 9-11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="claim-done-title">Got it, {name.trim().split(' ')[0] || 'thanks'}.</div>
            <div className="claim-done-body">
              Lauren will text you inside <strong>4 hours</strong>.
              <br />She handles your case start to finish — no email, no chasing.
            </div>

            <div className="claim-done-card">
              <div className="claim-done-k">Claim reference</div>
              <div className="claim-done-v">{claimReference}</div>
            </div>

            <button type="button" className="claim-done-close" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lauren AI sheet ──────────────────────────────────────────────────────────

interface ChatMsg { role: 'user' | 'assistant'; content: string }

function LaurenAISheet({
  open, onClose, token,
}: { open: boolean; onClose: () => void; token: TokenView }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const personalizationContext = (() => {
    const amt = token.confirmed
      ? `$${(token.confirmedAmount ?? 0).toLocaleString('en-US')} (confirmed by the court)`
      : `roughly $${token.estimatedLow.toLocaleString('en-US')}–$${token.estimatedHigh.toLocaleString('en-US')} (estimated from court records)`;
    return [
      `Person: ${[token.firstName, token.lastName].filter(Boolean).join(' ') || 'Former Ohio homeowner'}`,
      `Property: ${token.propertyAddress}, ${token.county} County OH`,
      `Case number: ${token.caseNumber}`,
      `Sold at sheriff's sale: ${token.saleDate} for $${token.salePrice.toLocaleString('en-US')}`,
      `Judgment debt paid off: $${token.judgmentAmount.toLocaleString('en-US')}`,
      `Their surplus: ${amt}`,
      `Money is held by the ${token.county} County Clerk of Courts.`,
    ].join('\n');
  })();

  useEffect(() => {
    if (open && messages.length === 0) {
      const firstName = token.firstName || 'there';
      setMessages([{
        role: 'assistant',
        content: `Hi ${firstName}, I'm Lauren. I handle surplus funds cases like yours at ${token.propertyAddress}. What's on your mind?`,
      }]);
      setTimeout(() => inputRef.current?.focus(), 350);
    }
    if (!open) {
      setMessages([]);
      setInput('');
      setThinking(false);
      setSessionId(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollTop = endRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || thinking) return;

    const userMsg: ChatMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setThinking(true);

    try {
      const res = await fetch(CONFIG.LAUREN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          session_id: sessionId,
          personalization_context: personalizationContext,
        }),
      });
      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);
      const reply = (data.reply || '').trim()
        || `Sorry — I'm having a hiccup on my end. You can text our team at (513) 516-2306 and we'll get right back to you.`;
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...next, {
        role: 'assistant',
        content: `Sorry — I'm having a hiccup on my end. You can text our team at (513) 516-2306 and we'll get right back to you.`,
      }]);
    } finally {
      setThinking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open) return null;

  const showQuickReplies = messages.length === 1 && !thinking;
  const quickReplies = [
    'Is this legit?',
    `What's the catch?`,
    'How long does it take?',
    'Who is the attorney?',
  ];

  return (
    <div className="la-scrim" role="dialog" aria-modal="true" aria-label="Chat with Lauren">
      <div className="la-sheet">
        <header className="la-header">
          <div className="la-header-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="la-avatar" src="/s-assets/lauren-cropped.png" alt="Lauren" />
            <div className="la-header-text">
              <div className="la-header-name">Lauren</div>
              <div className="la-header-sub">
                <span className="la-dot" aria-hidden="true" /> Surplus case agent · online
              </div>
            </div>
          </div>
          <button type="button" className="la-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="la-body" ref={endRef}>
          {messages.map((m, i) => (
            <div key={i} className={`la-msg la-msg-${m.role}`}>
              <div className="la-bubble">{m.content}</div>
            </div>
          ))}
          {thinking && (
            <div className="la-msg la-msg-assistant">
              <div className="la-bubble la-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          {showQuickReplies && (
            <div className="la-quick">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="la-quick-btn"
                  onClick={() => send(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="la-inputbar">
          <input
            ref={inputRef}
            className="la-input"
            type="text"
            placeholder="Ask Lauren anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={thinking}
          />
          <button
            type="button"
            className="la-send"
            onClick={() => send()}
            disabled={!input.trim() || thinking}
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l12-6-4 14-3-6-5-2z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="la-foot">
          AI agent · trained on Ohio surplus funds law. For a human, text{' '}
          <a href="sms:+15135162306">(513) 516-2306</a>.
        </div>
      </div>
    </div>
  );
}

// ── Root export ──────────────────────────────────────────────────────────────

export default function PersonalizedClient({ link }: { link: PersonalizedLink }) {
  const token = mapLinkToToken(link);
  const [modalOpen, setModalOpen] = useState(false);
  const [laurenOpen, setLaurenOpen] = useState(false);

  return (
    <div className="pass-root" data-bg="flat" data-gold="full">
      <PassHero
        token={token}
        onStartClaim={() => setModalOpen(true)}
        onTalkToLauren={() => setLaurenOpen(true)}
      />
      <WhyWeReachOut county={token.county} />
      <CaseCard token={token} />
      <FAQ token={token} />

      <ClaimModal open={modalOpen} onClose={() => setModalOpen(false)} token={token} />
      <LaurenAISheet open={laurenOpen} onClose={() => setLaurenOpen(false)} token={token} />
    </div>
  );
}
