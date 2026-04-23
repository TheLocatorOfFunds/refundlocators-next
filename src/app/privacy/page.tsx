import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — RefundLocators',
  description: 'How RefundLocators collects, uses, and protects your information.',
};

const EFFECTIVE = 'April 22, 2026';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--cream)', fontFamily: 'var(--font)' }}>
      <nav style={{
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0,
        background: 'rgba(5,17,31,.95)', backdropFilter: 'blur(12px)', zIndex: 100,
      }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 16, color: 'var(--cream)', textDecoration: 'none', letterSpacing: '-.02em' }}>
          RefundLocators
        </Link>
        <a href="tel:+15135162306" style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
          (513) 516‑2306
        </a>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 24px 100px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>
          Legal
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8, color: 'var(--cream)' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: 'var(--cream-45)', marginBottom: 48 }}>Effective {EFFECTIVE}</p>

        <Section title="Who we are">
          RefundLocators is a trade name of FundLocators LLC, an Indiana limited liability company operating in Ohio. We help former homeowners locate and recover government-held surplus funds from foreclosure sales. Our principal contact is Nathan Johnson, CEO, reachable at{' '}
          <a href="tel:+15135162306" style={{ color: 'var(--gold)' }}>(513) 516‑2306</a>.
        </Section>

        <Section title="Information we collect">
          <ul style={listStyle}>
            <li><strong>Contact information</strong> you voluntarily provide: name, phone number, email address, and former property address.</li>
            <li><strong>Case data</strong> we retrieve from publicly available Ohio court records based on your address — including sale prices, judgment amounts, and surplus estimates.</li>
            <li><strong>Usage data</strong> automatically collected when you visit our site: IP address, browser type, pages visited, and time on site.</li>
            <li><strong>Communications</strong> you send through our AI assistant (Lauren) or our contact form.</li>
          </ul>
          We do not collect Social Security numbers, bank account numbers, or payment card information.
        </Section>

        <Section title="How we use your information">
          <ul style={listStyle}>
            <li>To determine whether you may have unclaimed surplus funds owed to you.</li>
            <li>To contact you about your potential recovery case via phone, text, or email.</li>
            <li>To prepare and send a recovery agreement for your review.</li>
            <li>To comply with applicable Ohio court procedures and legal requirements.</li>
            <li>To improve our AI assistant and service quality.</li>
          </ul>
          We do not sell your personal information. We do not share it with third parties except our licensed Ohio attorneys who file claims on your behalf, and technology service providers (Supabase, Vercel) who process data under confidentiality agreements.
        </Section>

        <Section title="Text message communications">
          By providing your phone number and engaging with us, you consent to receive informational and transactional text messages from RefundLocators regarding your case. Message and data rates may apply. You may opt out at any time by replying STOP.
        </Section>

        <Section title="Data retention">
          We retain your information for as long as your potential or active recovery case exists, plus a reasonable period thereafter for legal and business purposes. You may request deletion of your personal information at any time by contacting us.
        </Section>

        <Section title="Your rights">
          You have the right to access, correct, or delete your personal information. To make a request, contact Nathan Johnson at{' '}
          <a href="tel:+15135162306" style={{ color: 'var(--gold)' }}>(513) 516‑2306</a> or email us directly. We will respond within 30 days.
        </Section>

        <Section title="Cookies">
          Our site uses minimal cookies necessary for site functionality. We do not use advertising cookies or cross-site tracking.
        </Section>

        <Section title="Changes to this policy">
          We may update this policy from time to time. The effective date at the top of this page will reflect the most recent revision. Continued use of our site constitutes acceptance of the updated policy.
        </Section>

        <Section title="Contact">
          FundLocators LLC · RefundLocators<br />
          Nathan Johnson, CEO<br />
          <a href="tel:+15135162306" style={{ color: 'var(--gold)' }}>(513) 516‑2306</a>
        </Section>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 20 }}>
          <Link href="/" style={{ fontSize: 13, color: 'var(--cream-45)', textDecoration: 'none' }}>← Home</Link>
          <Link href="/terms" style={{ fontSize: 13, color: 'var(--cream-45)', textDecoration: 'none' }}>Terms of Service →</Link>
        </div>
      </div>
    </div>
  );
}

const listStyle: React.CSSProperties = {
  paddingLeft: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  margin: '12px 0',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--cream)', marginBottom: 12, letterSpacing: '-.01em' }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: 'var(--cream-70)', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}
