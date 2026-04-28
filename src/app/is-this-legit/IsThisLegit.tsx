'use client';

import { useState } from 'react';
import LaurenSheet from '@/components/LaurenSheet';

export default function IsThisLegit() {
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

        <div style={S.eyebrow}>PUBLIC-SERVICE NOTICE</div>
        <h1 style={S.h1}>Is surplus funds recovery a scam?</h1>
        <p style={S.lede}>
          Short answer: the <em>industry</em> isn&apos;t a scam — but plenty of bad
          actors operate in it. Here&apos;s how to tell who&apos;s real, what
          questions to ask, and why we built RefundLocators differently.
        </p>

        {/* Section 1 — what surplus actually is */}
        <h2 style={S.h2}>First — what surplus funds actually are</h2>
        <p style={S.p}>
          When a home is sold at a sheriff&apos;s sale (foreclosure auction) for more
          than the mortgage debt plus fees, the leftover money — the <strong>surplus</strong> —
          legally belongs to the former homeowner. Ohio Revised Code{' '}
          <a href="https://codes.ohio.gov/ohio-revised-code/section-2329.44" target="_blank" rel="noopener noreferrer" style={S.link}>§ 2329.44</a>{' '}
          requires the court to return that money to the original owner. Counties hold
          billions of dollars of unclaimed surplus across the country, mostly because
          nobody told the homeowner it existed.
        </p>
        <p style={S.p}>
          You can file the claim yourself for free at the county clerk of courts.
          You don&apos;t have to use anyone. Recovery services exist because most
          people don&apos;t know they&apos;re owed anything, can&apos;t navigate the
          court paperwork, or want an attorney handling it instead of filing pro se.
        </p>

        {/* Section 2 — red flags */}
        <h2 style={S.h2}>Red flags — when to walk away</h2>
        <div style={S.flags}>
          {RED_FLAGS.map((f, i) => (
            <div key={i} style={S.flag}>
              <span style={S.flagIcon}>⚠</span>
              <div>
                <div style={S.flagTitle}>{f.title}</div>
                <div style={S.flagBody}>{f.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 3 — how to verify */}
        <h2 style={S.h2}>How to verify any recovery service before you sign</h2>
        <ol style={S.ol}>
          <li><strong>Look up their LLC or law firm</strong> on the Ohio Secretary of State at <a href="https://businesssearch.ohiosos.gov/" target="_blank" rel="noopener noreferrer" style={S.link}>businesssearch.ohiosos.gov</a>. Real entity? Registered address? Officer names match what they told you?</li>
          <li><strong>If they say &ldquo;attorney-led,&rdquo; ask for the attorney&apos;s name and Ohio bar number</strong> — then verify it at <a href="https://www.supremecourt.ohio.gov/AttorneySearch/" target="_blank" rel="noopener noreferrer" style={S.link}>supremecourt.ohio.gov/AttorneySearch</a>. Active license? Any disciplinary history?</li>
          <li><strong>Verify the surplus exists</strong> by calling the county clerk of courts directly. The clerk will tell you whether your case has unclaimed funds — for free, no agent required.</li>
          <li><strong>Search the Ohio Attorney General consumer complaints</strong> at <a href="https://www.ohioattorneygeneral.gov/Business/Services-for-Business/Better-Business-Bureau" target="_blank" rel="noopener noreferrer" style={S.link}>ohioattorneygeneral.gov</a> for the company name. Real complaints surface here.</li>
          <li><strong>Read the contract before you sign.</strong> Specifically look for: the percentage they take, what happens if they recover nothing, whether you can cancel, who actually files the paperwork (them or an attorney they pay), and how funds are disbursed (directly to you or through them first — direct is safer).</li>
          <li><strong>If you can call them and a real person picks up,</strong> that&apos;s a very good sign. If you only ever get email/text and they want you to sign immediately, that&apos;s a very bad one.</li>
        </ol>

        {/* Section 4 — what we promise */}
        <h2 style={S.h2}>How RefundLocators is built differently</h2>
        <ul style={S.ul}>
          <li><strong>We will never ask for your Social Security number, bank account, credit card, or login credentials</strong> to start. None of that is needed to identify a surplus claim. If a service asks for it upfront, walk away — that goes for us, them, and anyone else.</li>
          <li><strong>You can verify our entity</strong> at the link above — we&apos;re FundLocators LLC, registered in Indiana, operating in Ohio.</li>
          <li><strong>We charge 25% of what we recover. Zero upfront, ever.</strong> If we recover $0 you owe $0. The 25% is in the offer, on this page, in the agreement you&apos;d sign, and on every quote. No hidden fees, no &ldquo;administrative costs,&rdquo; no add-ons.</li>
          <li><strong>A licensed Ohio attorney files your claim</strong> — not us. Their name and Ohio bar number are in the agreement before you sign.</li>
          <li><strong>You can call our founder Nathan directly</strong> at <a href="tel:+15135162306" style={S.link}>(513) 516-2306</a>. Not a call center, not an answering service — his actual cell. Most services hide their leadership; ours doesn&apos;t.</li>
          <li><strong>You can also verify us with the Ohio Attorney General Consumer Protection line</strong> at <a href="tel:18002823784" style={S.link}>1-800-282-3784</a> — they&apos;ll confirm any complaints (we have none) and answer questions about surplus recovery in general.</li>
        </ul>

        {/* Section 5 — the founder bit */}
        <h2 style={S.h2}>Why I built this</h2>
        <p style={S.p}>
          I (Nathan) lost a home to foreclosure in Ohio. Nobody told me there was
          surplus money I could claim. By the time I figured it out, I&apos;d been
          cold-called by half a dozen recovery companies — most of them aggressive,
          half of them charging 30-40%, none of them transparent. I built
          RefundLocators because the people this happens to deserve a service that
          treats them like the homeowners they were, not the marks they&apos;re
          treated as.
        </p>
        <p style={S.p}>
          That&apos;s why our fee is fixed at 25% with no add-ons. Why our attorney
          is named in writing. Why my phone number is on this page. Why we built an
          AI agent (Lauren) who can answer your questions in plain English at 11 PM
          when you&apos;re scared and Googling. And why this page exists at all —
          most companies in this space hope you don&apos;t ask the &ldquo;is this a
          scam?&rdquo; question. We hope you do.
        </p>

        {/* CTA */}
        <div style={S.cta}>
          <button type="button" onClick={() => setLaurenOpen(true)} style={S.ctaPrimary}>
            <span style={S.ctaDot} aria-hidden="true" />
            Ask Lauren anything
          </button>
          <a href="/" style={S.ctaSecondary}>Back to home →</a>
        </div>

        {/* Footer / disclaimer */}
        <footer style={S.footer}>
          <p style={S.disclaimer}>
            RefundLocators is a trade name of FundLocators LLC, a private company
            registered in Indiana, operating in Ohio. We are not a government agency
            and do not provide legal advice. Surplus claims are filed by a licensed
            Ohio attorney on our team.
          </p>
        </footer>
      </article>

      <LaurenSheet open={laurenOpen} onClose={() => setLaurenOpen(false)} />
    </div>
  );
}

// ── Content data ────────────────────────────────────────────────────────────

const RED_FLAGS = [
  {
    title: 'They want money upfront.',
    body: 'A legitimate recovery service is paid only when you are paid. If they ask for "filing fees," "administrative fees," or any payment before you receive your check, walk away.',
  },
  {
    title: 'They ask for your Social Security number, bank login, or credit card.',
    body: 'None of those are needed to identify or file a surplus claim. The court already has your case information. Asking for sensitive data upfront is the single most common warning sign.',
  },
  {
    title: 'They will not name their attorney or share a bar number.',
    body: 'Anyone can claim "attorney-led." A real one will give you the attorney\'s name and Ohio bar number in writing — and it will check out at supremecourt.ohio.gov/AttorneySearch.',
  },
  {
    title: 'They pressure you to sign immediately or claim "the deadline is tomorrow."',
    body: 'Ohio surplus claims have a five-year window. If a service is pushing extreme urgency, they\'re trying to bypass your due diligence. Real deadlines exist but rarely require same-day signing.',
  },
  {
    title: 'They will not disclose their fee percentage upfront.',
    body: 'Real services state their fee in the first conversation, in writing, without you having to ask twice. "We can discuss fees after you sign" is a no.',
  },
  {
    title: 'Funds flow through them, not directly to you.',
    body: 'Safer model: the court releases funds directly to your bank, then you pay the recovery service their cut. Riskier model: the court releases to the recovery company, who then pays you. The second model lets bad actors disappear with the money.',
  },
  {
    title: 'You cannot find them on the Ohio Secretary of State business search.',
    body: 'Every legitimate Ohio recovery service is a registered LLC or law firm. If they don\'t show up on businesssearch.ohiosos.gov under the name they gave you, that\'s the end of the conversation.',
  },
];

// ── Styles ──────────────────────────────────────────────────────────────────

const C = {
  bg:      '#0a0a0a',
  cream:   '#f0ece4',
  cream70: 'rgba(240,236,228,0.70)',
  cream45: 'rgba(240,236,228,0.45)',
  cream20: 'rgba(240,236,228,0.20)',
  cream10: 'rgba(240,236,228,0.10)',
  gold:    '#c9a24a',
  green:   '#3ecf8e',
};

type CSS = React.CSSProperties;
const S: { [key: string]: CSS } = {
  article: {
    maxWidth: 720, margin: '0 auto', padding: '32px 22px 80px',
    color: C.cream, fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif',
    lineHeight: 1.6,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 40,
  },
  brandLink: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: C.cream },
  pin: { display: 'inline-flex', filter: 'drop-shadow(0 4px 12px rgba(201,162,74,0.35))' },
  brandWord: { fontFamily: '"New York", "Charter", Georgia, serif', fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em' },
  headerLink: { fontSize: 13, color: C.cream45, textDecoration: 'none' },

  eyebrow: {
    fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 11,
    letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold,
    marginBottom: 16,
  },
  h1: {
    fontFamily: '"New York", "Charter", Georgia, serif',
    fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 500, lineHeight: 1.1,
    letterSpacing: '-0.025em', margin: '0 0 20px',
  },
  lede: { fontSize: 17, color: C.cream70, marginBottom: 36, maxWidth: 600 },

  h2: {
    fontFamily: '"New York", "Charter", Georgia, serif',
    fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 500,
    letterSpacing: '-0.015em', marginTop: 48, marginBottom: 14,
    paddingTop: 28, borderTop: `1px solid ${C.cream10}`,
  },
  p: { fontSize: 15.5, color: C.cream70, marginBottom: 16, lineHeight: 1.7 },

  flags: { display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 },
  flag: {
    display: 'grid', gridTemplateColumns: '24px 1fr', gap: 14,
    padding: '14px 16px', borderRadius: 10,
    background: 'rgba(240,236,228,0.025)', border: `1px solid ${C.cream10}`,
  },
  flagIcon: { color: C.gold, fontSize: 18, lineHeight: 1.1 },
  flagTitle: { fontSize: 14.5, fontWeight: 600, color: C.cream, marginBottom: 4 },
  flagBody: { fontSize: 13.5, color: C.cream70, lineHeight: 1.55 },

  ol: { paddingLeft: 22, color: C.cream70, fontSize: 15, lineHeight: 1.75, marginBottom: 16 },
  ul: { paddingLeft: 22, color: C.cream70, fontSize: 15, lineHeight: 1.75, marginBottom: 16 },

  link: { color: C.gold, textDecoration: 'underline', textDecorationThickness: 1, textUnderlineOffset: 3 },

  cta: {
    display: 'flex', flexDirection: 'column', gap: 10,
    marginTop: 48, padding: '24px',
    background: 'rgba(201,162,74,0.05)',
    border: `1px solid rgba(201,162,74,0.25)`,
    borderRadius: 14,
  },
  ctaPrimary: {
    height: 52, borderRadius: 10, border: `1px solid rgba(201,162,74,0.45)`,
    background: 'rgba(201,162,74,0.12)', color: C.cream,
    fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  ctaDot: {
    width: 8, height: 8, borderRadius: '50%', background: C.green,
    boxShadow: `0 0 0 2px rgba(62,207,142,0.20), 0 0 8px rgba(62,207,142,0.55)`,
  },
  ctaSecondary: {
    textAlign: 'center', padding: '12px', fontSize: 14, color: C.cream45,
    textDecoration: 'none', borderRadius: 10,
  },

  footer: { marginTop: 60, paddingTop: 24, borderTop: `1px solid ${C.cream10}` },
  disclaimer: { fontSize: 11.5, color: C.cream45, lineHeight: 1.6, margin: 0 },
};
