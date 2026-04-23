import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — RefundLocators',
  description: 'Terms and conditions for using RefundLocators surplus fund recovery services.',
};

const EFFECTIVE = 'April 22, 2026';

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ fontSize: 13, color: 'var(--cream-45)', marginBottom: 48 }}>Effective {EFFECTIVE}</p>

        <Section title="About RefundLocators">
          RefundLocators is a trade name of FundLocators LLC, an Indiana limited liability company. We are not attorneys and do not provide legal advice. We are surplus fund recovery specialists who work alongside licensed Ohio attorneys to file claims on behalf of eligible former homeowners.
        </Section>

        <Section title="Our service">
          RefundLocators identifies potential surplus funds held by Ohio county courts following foreclosure sales. If you engage us, we will:
          <ul style={listStyle}>
            <li>Research your specific case using publicly available court records.</li>
            <li>Determine whether surplus funds are available and estimate the recoverable amount.</li>
            <li>Coordinate with our attorney partner (Jeff Kalniz, Ohio Bar #0068927) to file your claim.</li>
            <li>Manage the recovery process through disbursement.</li>
          </ul>
        </Section>

        <Section title="Fees and contingency">
          Our standard fee is <strong style={{ color: 'var(--gold)' }}>20% of funds recovered</strong>. You pay nothing unless we successfully recover funds on your behalf. In cases requiring contested litigation, a fee of 35% applies — you will be informed of this before signing any agreement. No upfront costs, deposits, or processing fees are charged under any circumstances.
        </Section>

        <Section title="Recovery agreement">
          Before we file any claim on your behalf, you will receive and must sign a written Recovery Agreement clearly stating: the estimated surplus amount, our fee percentage, the name and bar number of the attorney handling your case, and your right to cancel. Your signature is required before any legal action is taken.
        </Section>

        <Section title="Timeline and outcomes">
          We commit to filing your claim within 7 business days of receiving a signed agreement. Disbursement timelines vary by county and case complexity — typically 60 to 180 days after filing. We cannot guarantee recovery in every case. Surplus funds may be reduced by valid senior liens, court costs, or other claims that take legal priority.
        </Section>

        <Section title="Not legal advice">
          Nothing on this website, in our AI assistant (Lauren), or in any communication from RefundLocators constitutes legal advice. We are not your attorneys. You are encouraged to consult independent legal counsel before signing any agreement.
        </Section>

        <Section title="Use of AI assistant">
          Our AI assistant, Lauren, is powered by large language model technology and is trained on Ohio surplus fund recovery procedures. Lauren may make errors. Information provided by Lauren is for general informational purposes only and should not be relied upon as legal or financial advice. All legally significant communications will come from Nathan Johnson or our attorney of record.
        </Section>

        <Section title="Intellectual property">
          All content on this website — including text, design, and software — is owned by FundLocators LLC. You may not reproduce, distribute, or create derivative works without written permission.
        </Section>

        <Section title="Limitation of liability">
          To the maximum extent permitted by applicable law, FundLocators LLC shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website or our services. Our total liability for any claim shall not exceed the fees actually paid to us by you in connection with the claim giving rise to the dispute.
        </Section>

        <Section title="Governing law">
          These Terms are governed by the laws of the State of Ohio. Any disputes shall be resolved in the state or federal courts located in Hamilton County, Ohio.
        </Section>

        <Section title="Changes to these terms">
          We may update these Terms from time to time. The effective date above will reflect the most recent revision. Continued use of our services constitutes acceptance of the updated Terms.
        </Section>

        <Section title="Contact">
          FundLocators LLC · RefundLocators<br />
          Nathan Johnson, CEO<br />
          <a href="tel:+15135162306" style={{ color: 'var(--gold)' }}>(513) 516‑2306</a>
        </Section>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 20 }}>
          <Link href="/" style={{ fontSize: 13, color: 'var(--cream-45)', textDecoration: 'none' }}>← Home</Link>
          <Link href="/privacy" style={{ fontSize: 13, color: 'var(--cream-45)', textDecoration: 'none' }}>Privacy Policy →</Link>
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
