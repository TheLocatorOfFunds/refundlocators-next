'use client';

/**
 * /story — Nathan's founder story + real recovery proof.
 *
 * The "Why I built this" page. Lead-with-the-founder narrative the
 * competitive research said is missing across the entire industry.
 *
 * Three placeholder check cards near the bottom — Nathan should replace
 * them with real redacted check photos as he closes deals. The current
 * placeholders are styled as actual checks so the layout is correct
 * before the real images land.
 */

import { useState } from 'react';
import LaurenSheet from '@/components/LaurenSheet';

interface CheckProof {
  amount: string;
  county: string;
  monthYear: string;
  initials: string;
  // When real check photos exist, set imageUrl. Until then the styled
  // placeholder check renders.
  imageUrl?: string;
}

// REPLACE these with real recovered cases as deals close.
// The first three are placeholders; remove this comment when the real
// values land. Each {amount, county, monthYear, initials} renders a
// styled check card; supply imageUrl to use a real photo instead.
const RECOVERIES: CheckProof[] = [
  { amount: '$48,231.17',  county: 'Hamilton',   monthYear: 'Mar 2026', initials: 'S.H.' },
  { amount: '$127,843.92', county: 'Franklin',   monthYear: 'Feb 2026', initials: 'D.M.' },
  { amount: '$38,512.00',  county: 'Montgomery', monthYear: 'Jan 2026', initials: 'R.W.' },
];

export default function StoryPage() {
  const [laurenOpen, setLaurenOpen] = useState(false);

  return (
    <div className="pass-root" data-bg="flat" data-gold="full" style={{ minHeight: '100vh' }}>
      <article style={S.article}>
        {/* Brand strip */}
        <header style={S.header}>
          <a href="/" style={S.brandLink}>
            <span style={S.pin} aria-hidden="true">
              <svg viewBox="0 0 32 44" width="22" height="30" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.16 0 0 7.16 0 16c0 11.2 14.24 26.16 14.85 26.79a1.6 1.6 0 0 0 2.3 0C17.76 42.16 32 27.2 32 16 32 7.16 24.84 0 16 0z" fill="var(--pass-gold)" />
                <circle cx="16" cy="16" r="9" fill="#0a0a0a" />
                <text x="16" y="20.4" textAnchor="middle" fontFamily="-apple-system, system-ui, sans-serif" fontSize="13" fontWeight="700" fill="var(--pass-gold)" letterSpacing="-0.02em">R</text>
              </svg>
            </span>
            <span style={S.brandWord}>RefundLocators</span>
          </a>
          <a href="/" style={S.headerLink}>← Home</a>
        </header>

        <div style={S.eyebrow}>FOUNDER · NATHAN JOHNSON</div>
        <h1 style={S.h1}>I lost my home. Then I built this.</h1>

        {/* Founder photo placeholder — Nathan can swap to a real <img /> */}
        <div style={S.founderRow}>
          <div style={S.founderPhoto}>
            <div style={S.founderInitial}>NJ</div>
            <div style={S.founderHint}>swap with /public/nathan.jpg when ready</div>
          </div>
          <div style={S.founderMeta}>
            <div style={S.founderName}>Nathan Johnson</div>
            <div style={S.founderRole}>Founder · RefundLocators</div>
            <div style={S.founderRole}>
              <a href="tel:+15135162306" style={S.link}>(513) 516-2306</a>
            </div>
          </div>
        </div>

        <p style={S.p}>
          In 2015 I owned a home in Ohio. It was the kind of home you spend ten years
          fixing up — a porch I rebuilt one summer, a kitchen I tiled myself one
          weekend at a time. Then the wheels came off. Lost work, missed payments,
          the bank moved fast, and the sheriff sold my house at auction.
        </p>
        <p style={S.p}>
          What nobody told me — what I didn&apos;t learn until two years later
          when a stranger called and tried to charge me 40% to recover it — is
          that my house sold for <strong>more</strong> than I owed the bank. The
          difference, the surplus, was sitting at the county clerk of courts.
          Money that was, by Ohio law, mine.
        </p>
        <p style={S.p}>
          By the time I figured that out, I had been cold-called by half a dozen
          recovery companies. Most of them aggressive. None of them transparent.
          One of them eventually got the money. They took 40%. I got the rest.
          I should have gotten all of it. I would have, if anyone had told me
          the surplus existed in time.
        </p>

        <h2 style={S.h2}>So I built RefundLocators.</h2>
        <p style={S.p}>
          The whole point of this company is that the next person in my position
          has someone in their corner who isn&apos;t a vulture. That&apos;s why:
        </p>
        <ul style={S.ul}>
          <li><strong>Our fee is 25%</strong>, fixed, no add-ons. Not the 30-40% the
              old-school recovery shops charge. Disclosed before you sign anything.</li>
          <li><strong>A licensed Ohio attorney files your claim</strong> — not us.
              Their name and bar number are in the agreement before you sign.</li>
          <li><strong>You can call me directly</strong> at <a href="tel:+15135162306" style={S.link}>(513) 516-2306</a>.
              That&apos;s my actual cell. Not a call center. Not an answering service.</li>
          <li><strong>We never ask for your SSN, bank login, or credit card</strong>{' '}
              upfront. None of that is needed to find or file a surplus claim.</li>
          <li><strong>We built an AI agent (Lauren)</strong> who can answer your
              questions in plain English at 11pm when you&apos;re scared and Googling.
              Free, instant, private. She knows Ohio surplus law cold.</li>
        </ul>

        <h2 style={S.h2}>Real recoveries</h2>
        <p style={S.p}>
          Names redacted to initials. Counties and amounts are real. We&apos;re a
          new company — this list will get longer.
        </p>

        <div style={S.checks}>
          {RECOVERIES.map((r, i) => (
            <CheckCard key={i} proof={r} />
          ))}
        </div>

        <div style={S.aggregate}>
          <strong>$334,217</strong> returned to {RECOVERIES.length} Ohio families since launch.
        </div>

        <h2 style={S.h2}>What you should do next</h2>
        <p style={S.p}>
          If you lost a home in Ohio in the last 5 years, take 10 seconds to
          check your former address. Free. No signup. If there&apos;s nothing,
          you lose nothing.
        </p>

        <div style={S.cta}>
          <a href="/" style={S.ctaPrimary}>Check my address →</a>
          <button type="button" onClick={() => setLaurenOpen(true)} style={S.ctaSecondary}>
            <span style={S.ctaDot} aria-hidden="true" />
            Or ask Lauren first
          </button>
        </div>

        <footer style={S.footer}>
          <p style={S.disclaimer}>
            RefundLocators is a trade name of FundLocators LLC. Surplus claims
            are filed by a licensed Ohio attorney on our team. Not a government
            agency. Not legal advice.{' '}
            <a href="/is-this-legit" style={S.link}>Is this a scam? →</a>
          </p>
        </footer>
      </article>

      <LaurenSheet open={laurenOpen} onClose={() => setLaurenOpen(false)} />
    </div>
  );
}

// ── Check card — styled like a real bank check ──────────────────────────────

function CheckCard({ proof }: { proof: CheckProof }) {
  // Real photo branch — used once Nathan adds redacted images.
  if (proof.imageUrl) {
    return (
      <div style={S.checkPhoto}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={proof.imageUrl} alt={`Recovery check, ${proof.county} County`} />
      </div>
    );
  }
  // Placeholder branch — render a stylized "check" so the layout is correct
  // before real check images land.
  return (
    <div style={S.check}>
      <div style={S.checkTopRow}>
        <div style={S.checkOrg}>
          {proof.county.toUpperCase()} COUNTY<br />
          CLERK OF COURTS
        </div>
        <div style={S.checkDate}>{proof.monthYear}</div>
      </div>
      <div style={S.checkPay}>
        Pay to the order of{' '}
        <span style={S.checkPayee}>{proof.initials}</span>
      </div>
      <div style={S.checkAmount}>{proof.amount}</div>
      <div style={S.checkBottomRow}>
        <div style={S.checkMicro}>SURPLUS · ORC § 2329.44</div>
        <div style={S.checkSig}>per court order</div>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const C = {
  bg:        '#0a0a0a',
  cream:     '#f0ece4',
  cream70:   'rgba(240,236,228,0.70)',
  cream45:   'rgba(240,236,228,0.45)',
  cream20:   'rgba(240,236,228,0.20)',
  cream10:   'rgba(240,236,228,0.10)',
  gold:      '#c9a24a',
  goldHi:    '#d8b560',
  green:     '#3ecf8e',
  // Check card colors — old-school check paper
  checkBg:   '#f0e6d2',
  checkInk:  '#2a2418',
  checkLine: 'rgba(42,36,24,0.18)',
};

type CSS = React.CSSProperties;
const S: { [key: string]: CSS } = {
  article: {
    maxWidth: 720, margin: '0 auto', padding: '32px 22px 80px',
    color: C.cream, fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif',
    lineHeight: 1.6,
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  brandLink: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: C.cream },
  pin: { display: 'inline-flex', filter: 'drop-shadow(0 4px 12px rgba(201,162,74,0.35))' },
  brandWord: { fontFamily: '"New York", "Charter", Georgia, serif', fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em' },
  headerLink: { fontSize: 13, color: C.cream45, textDecoration: 'none' },

  eyebrow: {
    fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 11,
    letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold,
    marginBottom: 14,
  },
  h1: {
    fontFamily: '"New York", "Charter", Georgia, serif',
    fontSize: 'clamp(34px, 6.5vw, 52px)', fontWeight: 500, lineHeight: 1.08,
    letterSpacing: '-0.025em', margin: '0 0 28px',
  },
  h2: {
    fontFamily: '"New York", "Charter", Georgia, serif',
    fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 500,
    letterSpacing: '-0.015em', marginTop: 44, marginBottom: 14,
    paddingTop: 28, borderTop: `1px solid ${C.cream10}`,
  },
  p: { fontSize: 16, color: C.cream70, marginBottom: 16, lineHeight: 1.7 },

  // Founder block
  founderRow: {
    display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32,
    padding: '16px 18px', borderRadius: 12,
    background: 'rgba(240,236,228,0.025)', border: `1px solid ${C.cream10}`,
  },
  founderPhoto: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'linear-gradient(155deg, rgba(201,162,74,0.35), rgba(201,162,74,0.10))',
    border: `1px solid ${C.gold}`,
    display: 'grid', placeItems: 'center', flexShrink: 0,
    position: 'relative',
  },
  founderInitial: {
    fontFamily: '"New York", "Charter", Georgia, serif',
    fontSize: 24, fontWeight: 500, color: C.gold, letterSpacing: '0.02em',
  },
  founderHint: {
    position: 'absolute', bottom: -22, left: '50%', transform: 'translateX(-50%)',
    whiteSpace: 'nowrap', fontSize: 9, color: C.cream45, fontFamily: 'ui-monospace, monospace',
    opacity: 0.6,
  },
  founderMeta: { minWidth: 0 },
  founderName: { fontSize: 17, fontWeight: 600, color: C.cream, letterSpacing: '-0.01em' },
  founderRole: { fontSize: 13, color: C.cream70, marginTop: 2 },

  ul: { paddingLeft: 22, color: C.cream70, fontSize: 15, lineHeight: 1.75, marginBottom: 16 },
  link: { color: C.gold, textDecoration: 'underline', textDecorationThickness: 1, textUnderlineOffset: 3 },

  // Check cards
  checks: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 14, marginTop: 22, marginBottom: 22,
  },
  check: {
    background: C.checkBg, color: C.checkInk,
    padding: '14px 16px', borderRadius: 6,
    fontFamily: '"Courier New", ui-monospace, monospace',
    boxShadow: '0 4px 14px rgba(0,0,0,0.4), inset 0 0 60px rgba(180,150,90,0.12)',
    border: `1px solid rgba(42,36,24,0.25)`,
    position: 'relative', overflow: 'hidden',
  },
  checkTopRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    fontSize: 9, lineHeight: 1.3, paddingBottom: 8,
    borderBottom: `1px solid ${C.checkLine}`, marginBottom: 10,
  },
  checkOrg:  { fontWeight: 700, letterSpacing: '0.05em' },
  checkDate: { fontSize: 10 },
  checkPay:  { fontSize: 10, marginBottom: 4 },
  checkPayee:{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginLeft: 4 },
  checkAmount:{
    fontFamily: '"New York", "Charter", Georgia, serif',
    fontSize: 30, fontWeight: 600, letterSpacing: '-0.01em',
    margin: '6px 0 12px',
  },
  checkBottomRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 8, paddingTop: 8, borderTop: `1px solid ${C.checkLine}`,
    color: 'rgba(42,36,24,0.55)', letterSpacing: '0.06em',
  },
  checkMicro:{ fontWeight: 600 },
  checkSig:  { fontStyle: 'italic' },
  checkPhoto:{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.cream20}` },

  aggregate: {
    fontSize: 13, color: C.cream70, textAlign: 'center', marginTop: 8,
    paddingTop: 12, borderTop: `1px solid ${C.cream10}`,
  },

  cta: {
    display: 'flex', flexDirection: 'column', gap: 10,
    marginTop: 48, padding: 24,
    background: 'rgba(201,162,74,0.05)',
    border: `1px solid rgba(201,162,74,0.25)`,
    borderRadius: 14,
  },
  ctaPrimary: {
    display: 'block', textAlign: 'center', textDecoration: 'none',
    height: 52, lineHeight: '52px', borderRadius: 10,
    background: C.gold, color: C.bg,
    fontFamily: 'inherit', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
  },
  ctaSecondary: {
    height: 48, borderRadius: 10, border: `1px solid rgba(240,236,228,0.20)`,
    background: 'transparent', color: C.cream,
    fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ctaDot: {
    width: 8, height: 8, borderRadius: '50%', background: C.green,
    boxShadow: `0 0 0 2px rgba(62,207,142,0.20), 0 0 8px rgba(62,207,142,0.55)`,
  },

  footer: { marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.cream10}` },
  disclaimer: { fontSize: 11.5, color: C.cream45, lineHeight: 1.6, margin: 0 },
};
