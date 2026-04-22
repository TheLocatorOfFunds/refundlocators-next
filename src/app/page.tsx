import HeroOrbs from '@/components/HeroOrbs';
import HeroSection from '@/components/HeroSection';
import StatsBar from '@/components/StatsBar';
import ScrollReveal from '@/components/ScrollReveal';
import LeadForm from '@/components/LeadForm';
import StickyBar from '@/components/StickyBar';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { OHIO_COUNTIES } from '@/lib/config';

const CheckIcon = () => (
  <span style={{
    flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
    background: 'var(--gold-bg)', border: '1px solid var(--border-g)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    marginTop: 2, color: 'var(--gold)',
  }}>
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
);

const TrustIcon = () => (
  <span style={{ flexShrink: 0, width: 20, height: 20, color: 'var(--gold)', marginTop: 3 }}>
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"/>
    </svg>
  </span>
);

export default function Home() {
  return (
    <>
      <HeroOrbs />

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'rgba(5,17,31,.75)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg viewBox="0 0 20 20" width="14" height="14" fill="#05111f">
              <circle cx="10" cy="10" r="8"/>
              <path d="M6 10h8M10 6v8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--cream)', letterSpacing: '-.01em' }}>
            RefundLocators
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'var(--cream-45)',
            background: 'var(--glass)', border: '1px solid var(--border)',
            padding: '5px 12px', borderRadius: 'var(--r-pill)',
            fontFamily: 'var(--mono)',
          }}>Ohio · AI-Powered</span>
          <a href="tel:+15139518855" style={{
            fontSize: 13, fontWeight: 600, color: 'var(--gold)', textDecoration: 'none',
            padding: '7px 14px', border: '1px solid var(--border-g)', borderRadius: 'var(--r-pill)',
            transition: 'background .15s',
          }}>(513) 951‑8855</a>
        </div>
      </nav>

      <HeroSection />

      {/* ── Main content ── */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '0 20px 120px' }}>

        <ScrollReveal><StatsBar /></ScrollReveal>

        {/* ── How it works ── */}
        <section style={{ marginBottom: 80 }}>
          <ScrollReveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: 10 }}>The process</span></ScrollReveal>
          <ScrollReveal delay={0.1}><h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--cream)', marginBottom: 14, lineHeight: 1.15 }}>How this works</h2></ScrollReveal>
          <ScrollReveal delay={0.2}><p style={{ fontSize: 15, color: 'var(--cream-70)', marginBottom: 32, maxWidth: 520 }}>Three steps. Starts with a conversation. Ends with money.</p></ScrollReveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                num: '01', title: 'Talk to Lauren',
                body: 'Tell Lauren your name and former address. She searches Ohio court records and pulls your exact case file — surplus amount, judgment, sale date, all of it.',
                chips: ['Free lookup', 'No signup', 'No obligation'],
              },
              {
                num: '02', title: 'Sign in 10 seconds',
                body: 'If you want us to file, we send a simple agreement by text. E-sign in under a minute. No uploads, no paperwork, no phone tag.',
                checks: ['25% of what we recover — nothing if we don\'t.', 'Zero dollars upfront — no hidden fees, ever.', 'Nathan\'s direct number in every agreement.'],
              },
              {
                num: '03', title: 'We file. You wait. Money arrives.',
                body: 'Our attorney files your claim within 7 business days of signing. You get weekly status texts every Tuesday and a live dashboard until the check clears.',
                checks: ['7-day filing commitment — fastest in Ohio.', '4-hour response window — text, email, or Nathan\'s cell.', 'Live case dashboard — always know where you stand.'],
              },
            ].map((step, i) => (
              <ScrollReveal key={step.num} delay={0.1 * (i + 1)}>
                <div style={{
                  background: 'var(--glass)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)', padding: 24,
                  transition: 'border-color .2s, background .2s',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '.14em', fontFamily: 'var(--mono)',
                    color: 'var(--gold)', background: 'var(--gold-bg)', border: '1px solid var(--border-g)',
                    padding: '3px 9px', borderRadius: 'var(--r-pill)', display: 'inline-block', marginBottom: 14,
                  }}>{step.num}</span>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--cream)', marginBottom: 8 }}>{step.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--cream-70)', lineHeight: 1.65 }}>{step.body}</div>
                  {step.chips && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                      {step.chips.map(c => (
                        <span key={c} style={{ fontSize: 11, fontWeight: 600, color: 'var(--cream-45)', background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 'var(--r-pill)' }}>{c}</span>
                      ))}
                    </div>
                  )}
                  {step.checks && (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                      {step.checks.map(c => (
                        <li key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--cream-70)', lineHeight: 1.5 }}>
                          <CheckIcon />
                          <span dangerouslySetInnerHTML={{ __html: c.replace(/^([^—]+—)/, '<strong>$1</strong>') }} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </ScrollReveal>
            ))}

            <ScrollReveal delay={0.4}>
              <div style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                background: 'var(--gold-bg)', border: '1px solid var(--border-g)',
                borderRadius: 'var(--r-lg)', padding: 20,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🎁</span>
                <p style={{ fontSize: 14, color: 'var(--cream-70)', margin: 0, lineHeight: 1.65 }}>
                  <strong style={{ color: 'var(--gold)' }}>A thank-you gift.</strong> When you sign your recovery agreement, we send you a new iPad. Our way of saying thanks for trusting us.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Why us ── */}
        <section style={{ marginBottom: 80 }}>
          <ScrollReveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: 10 }}>The difference</span></ScrollReveal>
          <ScrollReveal delay={0.1}><h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--cream)', marginBottom: 14, lineHeight: 1.15 }}>Why us vs. everyone<br/>else calling you right now.</h2></ScrollReveal>
          <ScrollReveal delay={0.2}><p style={{ fontSize: 15, color: 'var(--cream-70)', marginBottom: 32, maxWidth: 520 }}>Every company pulls names from the same public records. Most dial a thousand phones a day and read from a script. We built an AI and put her to work.</p></ScrollReveal>

          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { icon: '💬', title: 'Best experience', body: 'Live dashboard. Weekly updates. Nathan\'s number in your contract. Lauren already knows your case.' },
              { icon: '⚡', title: 'Most available', body: '4-hour response window, any day. Text, email, chat, or call. Ohio-based. We\'ll drive to you.' },
              { icon: '🚀', title: 'Quickest to file', body: 'Filed within 7 business days of signing. No uploads or phone tag. Your case moves before others have called you back.' },
            ].map((p, i) => (
              <ScrollReveal key={p.title} delay={0.1 * (i + 1)}>
                <div style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, height: '100%' }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{p.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cream)', marginBottom: 8 }}>{p.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--cream-70)', lineHeight: 1.65 }}>{p.body}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Nathan's story ── */}
        <section style={{ marginBottom: 80 }}>
          <ScrollReveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: 10 }}>Why this exists</span></ScrollReveal>
          <ScrollReveal delay={0.1}><h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--cream)', marginBottom: 32, lineHeight: 1.15 }}>This happened to me.</h2></ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
              <div style={{ padding: '28px 28px 0' }}>
                <div style={{ fontSize: 'clamp(18px,3vw,26px)', lineHeight: 1.5, color: 'var(--cream)', fontStyle: 'italic', fontWeight: 500, marginBottom: 24 }}>
                  &ldquo;This happened to me. This is why I know this — because I owned a home. I went into foreclosure. I lost my home. And nobody, like what I do existed. Nobody came to me and explained anything. Nobody tried to help me. And so after I went through that process, I learned it, and now my life&apos;s mission is to help people get access to that money.&rdquo;
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 28 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-d), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'var(--bg)', flexShrink: 0 }}>N</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cream)' }}>Nathan Johnson</div>
                    <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 2 }}>CEO · RefundLocators · Ohio</div>
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '18px 28px', background: 'rgba(255,255,255,.02)', display: 'flex', gap: 12 }}>
                <a href="tel:+15139518855" style={{
                  flex: 1, background: 'var(--gold)', color: 'var(--bg)',
                  fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  padding: '12px 20px', borderRadius: 'var(--r-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  boxShadow: 'var(--shadow-gold)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                  (513) 951‑8855
                </a>
                <ScrollToTopButton />
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ── Trust ── */}
        <section style={{ marginBottom: 80 }}>
          <ScrollReveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: 10 }}>Proof</span></ScrollReveal>
          <ScrollReveal delay={0.1}><h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--cream)', marginBottom: 32, lineHeight: 1.15 }}>You can verify everything we say.</h2></ScrollReveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: 'Registered business', body: 'FundLocators LLC, registered in Indiana, operating across Ohio.' },
              { title: 'Attorney partnership', body: 'All claims filed through licensed Ohio attorneys. Their fee is included in ours — you pay nothing extra.' },
              { title: 'Contingency-only', body: 'Our 25% fee comes from recovered funds only. If we don\'t recover, you owe nothing — ever.' },
              { title: 'Ohio-only focus', body: 'We don\'t work nationally. We work this state, thoroughly. Hamilton, Warren, and Butler county procedures — cold.' },
              { title: 'Fully transparent', body: 'No upfront fees. No hidden terms. 25% is in the offer, on this page, and in the signed contract.' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={0.08 * i}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px', borderRadius: 'var(--r-md)', background: 'var(--glass)', border: '1px solid var(--border)' }}>
                  <TrustIcon />
                  <div>
                    <strong style={{ display: 'block', fontSize: 14, color: 'var(--cream)', marginBottom: 3 }}>{item.title}</strong>
                    <span style={{ fontSize: 13, color: 'var(--cream-45)' }}>{item.body}</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.4}>
            <p style={{ marginTop: 14, fontSize: 12, color: 'var(--cream-20)' }}>This is not a government service. RefundLocators is a private company. We are not attorneys.</p>
          </ScrollReveal>
        </section>

        {/* ── FAQ ── */}
        <section style={{ marginBottom: 80 }}>
          <ScrollReveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: 10 }}>FAQ</span></ScrollReveal>
          <ScrollReveal delay={0.1}><h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--cream)', marginBottom: 32, lineHeight: 1.15 }}>Questions people always ask.</h2></ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {[
                { q: 'Is this a scam?', a: 'No. FundLocators LLC is a registered private company. We charge zero upfront. You pay a percentage only if we successfully recover money for you. Everything is in writing before you sign anything.' },
                { q: 'How does Lauren know about my case?', a: 'Foreclosure filings are public records. Lauren reads court documents — judgment amounts, sale dates, distribution orders — across all Ohio counties to identify homeowners who may be owed surplus funds.' },
                { q: 'Why are multiple companies contacting me?', a: 'Because the court records are public, many companies see the same data. What\'s different here: Lauren has already read your case file before you ask the first question. Our fee and process are disclosed in writing before you sign anything.' },
                { q: 'What exactly do you charge?', a: '25% of what we recover. Zero upfront, nothing out of pocket. If we don\'t recover money for you, you owe us nothing. That\'s in the offer, on this page, and in the signed agreement.' },
                { q: 'Are you attorneys?', a: 'No. We are foreclosure intelligence specialists. We partner with licensed Ohio attorneys who file the actual claims. Their fees are covered by our contingency — you don\'t pay them separately.' },
                { q: 'How long does it take?', a: 'We file within 7 business days of signing — that\'s our commitment. After filing, the court\'s timeline varies by county, typically 3 to 6 months. You get weekly status updates and a live dashboard the whole time.' },
              ].map((item, i) => (
                <details key={item.q} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 20px', cursor: 'pointer', userSelect: 'none' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)' }}>{item.q}</span>
                    <span style={{ color: 'var(--gold)', fontSize: 20, fontWeight: 300, flexShrink: 0, lineHeight: 1 }}>+</span>
                  </summary>
                  <div style={{ padding: '0 20px 18px', fontSize: 14, color: 'var(--cream-70)', lineHeight: 1.7 }}>{item.a}</div>
                </details>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ── Form ── */}
        <section id="check-form" style={{ marginBottom: 80 }}>
          <ScrollReveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: 10 }}>Prefer a form?</span></ScrollReveal>
          <ScrollReveal delay={0.1}><h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--cream)', marginBottom: 14, lineHeight: 1.15 }}>Submit your information</h2></ScrollReveal>
          <ScrollReveal delay={0.2}><p style={{ fontSize: 15, color: 'var(--cream-70)', marginBottom: 32, maxWidth: 520 }}>Fill this out and we&apos;ll text you what we find. Same free lookup — no obligation.</p></ScrollReveal>
          <ScrollReveal delay={0.3}><LeadForm counties={OHIO_COUNTIES} /></ScrollReveal>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid var(--border)', paddingTop: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cream)', marginBottom: 10 }}>RefundLocators</div>
          <p style={{ fontSize: 12, color: 'var(--cream-20)', lineHeight: 1.75 }}>
            RefundLocators is a trade name of FundLocators LLC, a private company registered in Indiana, operating in Ohio.
            We are not attorneys and do not provide legal advice. We are not affiliated with any government agency or court.<br />
            Nathan Johnson, CEO · <a href="tel:+15139518855" style={{ color: 'var(--gold)', textDecoration: 'none' }}>(513) 951‑8855</a>
          </p>
        </footer>
      </main>

      <StickyBar />
    </>
  );
}
