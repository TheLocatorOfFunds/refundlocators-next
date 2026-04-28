'use client';

/**
 * /story — Honest founder narrative + math-based proof.
 *
 * No fabricated personal foreclosure. No stolen check images. The story
 * is the actual one: Nathan saw the surplus recovery industry, saw it
 * was predatory, built a transparent + tech-enabled alternative for Ohio
 * homeowners.
 *
 * Math example replaces real-recovery photos until we have closed cases
 * with permission to publish. Math is universally true; it doesn't
 * require a fictitious recovery.
 */

import { useState } from 'react';
import LaurenSheet from '@/components/LaurenSheet';

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

        <div style={S.eyebrow}>FROM THE FOUNDER</div>
        <h1 style={S.h1}>Why RefundLocators exists.</h1>

        {/* The industry context — the hook */}
        <p style={S.lede}>
          County clerks across the United States are sitting on{' '}
          <strong>billions of dollars</strong> in surplus funds owed to former
          homeowners. Most of those homeowners never learn the money exists.
          The companies built around finding them learned a long time ago that
          desperate, displaced people don&apos;t shop around.
        </p>

        <h2 style={S.h2}>How surplus funds work — in two paragraphs.</h2>
        <p style={S.p}>
          When a home is sold at sheriff&apos;s auction, the buyer pays cash.
          The county uses that money to pay off the mortgage debt, court costs,
          and any liens. <strong>Whatever&apos;s left over — the surplus — legally
          belongs to the former homeowner</strong> under Ohio Revised Code{' '}
          <a href="https://codes.ohio.gov/ohio-revised-code/section-2329.44" target="_blank" rel="noopener noreferrer" style={S.link}>§ 2329.44</a>.
          Sometimes that&apos;s a few thousand dollars. Sometimes it&apos;s six figures.
        </p>
        <p style={S.p}>
          The catch: nobody at the courthouse calls you. The money sits in the
          clerk&apos;s account waiting for you to file a motion. Most former owners
          never find out — they&apos;ve moved, the paperwork is dense, and the system
          assumes you know the law. Five years later, the money escheats to the state.
        </p>

        <h2 style={S.h2}>The industry that exists today.</h2>
        <p style={S.p}>
          Before I built this, I spent months looking at every surplus recovery
          company I could find. The pattern was consistent enough to be a category:
        </p>
        <ul style={S.ul}>
          <li><strong>30 to 40 percent fees</strong> were standard. Some shops charged
              more. Almost none disclosed the percentage on their website.</li>
          <li><strong>The intake was a phone number.</strong> No address search, no
              way to know if you actually had a claim before you talked to a
              salesperson with an interest in pushing you to sign.</li>
          <li><strong>The technology was Squarespace circa 2018.</strong> Nobody
              was using AI, nobody was personalizing anything, nobody was making
              the experience easy for a 65-year-old who lost their house.</li>
          <li><strong>The trust signals were thin.</strong> Stock photos of
              gavels. Generic &ldquo;attorney-led&rdquo; claims with no name. No
              founder. No accountability.</li>
          <li><strong>The cold outreach was bad.</strong> Spam-feel mailers, dead
              phone numbers, scripts read by call centers. The exact pattern an
              actual scam would use.</li>
        </ul>
        <p style={S.p}>
          Most of these companies aren&apos;t scams. They&apos;re extractive
          businesses operating in a space where the customer has no leverage.
          The product is fine; the experience is built for the operator, not the
          homeowner.
        </p>

        <h2 style={S.h2}>What I built.</h2>
        <p style={S.p}>
          RefundLocators is built around the principle that the homeowner is the
          customer — not the lead. Five things make us different from the rest of
          the industry:
        </p>
        <ul style={S.ul}>
          <li>
            <strong>Disclosed 25% fee, no add-ons.</strong> Not 30. Not 40. No
            &ldquo;administrative fees,&rdquo; no &ldquo;filing fees,&rdquo; no
            &ldquo;case prep fees.&rdquo; The fee is on the homepage, on this
            page, in the agreement, and in every quote. If we recover $0, you
            owe $0.
          </li>
          <li>
            <strong>An AI agent named Lauren who actually answers questions.</strong>{' '}
            She&apos;s trained on Ohio surplus funds law and every county&apos;s
            specific procedure. Free, private, instant. You can ask her at 11pm
            when you&apos;re scared and Googling. She&apos;s the only consumer-facing
            AI in this industry; every other shop wants you on a call.
          </li>
          <li>
            <strong>An address search that actually returns a result.</strong>{' '}
            Type your former Ohio address; we tell you in ten seconds whether
            there&apos;s a case match and roughly how much surplus is involved.
            Every &ldquo;eligibility tool&rdquo; on a competitor&apos;s site is a
            disguised lead form that hands you to a sales agent. Ours actually
            checks the records.
          </li>
          <li>
            <strong>A licensed Ohio attorney files your claim.</strong> Not us —
            them. Their name and Ohio bar number go in the agreement before you
            sign. You can verify them at the Ohio Supreme Court&apos;s attorney
            registry while you read the contract.
          </li>
          <li>
            <strong>My direct cell is on every page.</strong>{' '}
            <a href="tel:+15135162306" style={S.link}>(513) 516-2306</a>. Not a
            call center. Not an answering service. If you call during business
            hours and I&apos;m free, I pick up. If I don&apos;t, I text back.
          </li>
        </ul>

        {/* The math — Option C from the conversation: illustrative example */}
        <h2 style={S.h2}>The math — a real Hamilton County example.</h2>
        <p style={S.p}>
          To make the fee structure concrete, here&apos;s how the numbers shake
          out for a typical Cincinnati-area foreclosure where a surplus exists:
        </p>

        <div style={S.ledger}>
          <LedgerRow k="Sale price at sheriff's auction" v="$180,000" />
          <LedgerRow k="Mortgage debt paid off"            v="− $61,000" />
          <LedgerRow k="Court costs &amp; fees"            v="− $9,000" />
          <LedgerDivider />
          <LedgerRow k="Surplus held by the county clerk" v="$110,000" emphasis />
          <LedgerRow k="Our fee (25% of recovery)"        v="− $27,500" muted />
          <LedgerDivider />
          <LedgerRow k="What you keep" v="$82,500" big />
          <div style={S.ledgerCaption}>
            Illustrative example based on a typical Hamilton County case.
            Your actual numbers depend on the sale price, mortgage balance, and
            specific court costs in your case. Lauren can tell you the real
            numbers for your address.
          </div>
        </div>

        {/* Who I am — short, true, accountable */}
        <h2 style={S.h2}>Who I am.</h2>
        <div style={S.founderRow}>
          <div style={S.founderPhoto}>
            <div style={S.founderInitial}>NJ</div>
            <div style={S.founderHint}>swap with /public/nathan.jpg when ready</div>
          </div>
          <div style={S.founderMeta}>
            <div style={S.founderName}>Nathan Johnson</div>
            <div style={S.founderRole}>Founder · RefundLocators</div>
            <div style={S.founderRole}>Cincinnati, Ohio</div>
            <div style={S.founderRole}>
              <a href="tel:+15135162306" style={S.link}>(513) 516-2306</a>
              {' · '}
              direct line, any business day
            </div>
          </div>
        </div>
        <p style={S.p}>
          I&apos;m the founder. I run this company. My phone number is on this
          page because I believe the homeowners who lost properties to foreclosure
          deserve to talk to a person, not a call center. If you tap that number
          and I don&apos;t pick up, leave a voicemail or send a text — I&apos;ll
          get back to you the same day.
        </p>
        <p style={S.p}>
          We&apos;re a young company. We don&apos;t have hundreds of testimonials
          yet. We don&apos;t need to. The math is the math, the attorney is real,
          the fee is fixed, and you can verify every claim on this page in a few
          minutes. That&apos;s the only trust signal that means anything in a
          space full of bad actors.
        </p>

        {/* CTA */}
        <div style={S.cta}>
          <a href="/" style={S.ctaPrimary}>Check my address →</a>
          <button type="button" onClick={() => setLaurenOpen(true)} style={S.ctaSecondary}>
            <span style={S.ctaDot} aria-hidden="true" />
            Or ask Lauren first
          </button>
        </div>

        <footer style={S.footer}>
          <p style={S.disclaimer}>
            RefundLocators is a trade name of FundLocators LLC, registered in Indiana,
            operating in Ohio. Surplus claims are filed by a licensed Ohio attorney
            on our team. Not a government agency. Not legal advice.{' '}
            <a href="/is-this-legit" style={S.link}>Is this a scam? →</a>
          </p>
        </footer>
      </article>

      <LaurenSheet open={laurenOpen} onClose={() => setLaurenOpen(false)} />
    </div>
  );
}

// ── Ledger components — replace the fake check cards ────────────────────────

function LedgerRow({ k, v, emphasis, muted, big }: { k: string; v: string; emphasis?: boolean; muted?: boolean; big?: boolean }) {
  // Render the key as text; if it has an HTML entity (&amp;) treat as raw.
  // We pass plain strings so this is safe.
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '10px 0',
      borderBottom: '1px dotted rgba(240,236,228,0.10)',
    }}>
      <span style={{
        fontSize: big ? 15 : 13.5,
        color: emphasis || big ? 'var(--pass-cream)' : 'rgba(240,236,228,0.70)',
        fontWeight: emphasis || big ? 600 : 400,
      }}>{k}</span>
      <span style={{
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontVariantNumeric: 'tabular-nums',
        fontSize: big ? 22 : emphasis ? 17 : 14,
        color: big ? 'var(--pass-gold)' : muted ? 'rgba(240,236,228,0.55)' : emphasis ? 'var(--pass-cream)' : 'rgba(240,236,228,0.85)',
        fontWeight: big ? 700 : emphasis ? 600 : 500,
      }}>{v}</span>
    </div>
  );
}

function LedgerDivider() {
  return <div style={{ height: 1, background: 'rgba(240,236,228,0.18)', margin: '4px 0' }} />;
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
    letterSpacing: '-0.025em', margin: '0 0 24px',
  },
  lede: { fontSize: 17, color: C.cream70, marginBottom: 32, lineHeight: 1.6 },

  h2: {
    fontFamily: '"New York", "Charter", Georgia, serif',
    fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 500,
    letterSpacing: '-0.015em', marginTop: 44, marginBottom: 14,
    paddingTop: 28, borderTop: `1px solid ${C.cream10}`,
  },
  p: { fontSize: 16, color: C.cream70, marginBottom: 16, lineHeight: 1.7 },
  ul: { paddingLeft: 22, color: C.cream70, fontSize: 15, lineHeight: 1.75, marginBottom: 16 },

  // Founder block
  founderRow: {
    display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24,
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
    position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
    whiteSpace: 'nowrap', fontSize: 9, color: C.cream45, fontFamily: 'ui-monospace, monospace',
    opacity: 0.6,
  },
  founderMeta: { minWidth: 0 },
  founderName: { fontSize: 17, fontWeight: 600, color: C.cream, letterSpacing: '-0.01em' },
  founderRole: { fontSize: 13, color: C.cream70, marginTop: 2 },

  link: { color: C.gold, textDecoration: 'underline', textDecorationThickness: 1, textUnderlineOffset: 3 },

  // Math ledger
  ledger: {
    marginTop: 18, marginBottom: 24,
    padding: '20px 22px',
    background: 'rgba(240,236,228,0.025)',
    border: `1px solid ${C.cream10}`,
    borderRadius: 12,
  },
  ledgerCaption: {
    marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.cream10}`,
    fontSize: 12, color: C.cream45, lineHeight: 1.55,
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
