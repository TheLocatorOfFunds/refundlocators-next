'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PersonalizedLink } from '@/lib/supabase';
import LaurenChat from '@/components/LaurenChat';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
});

const rowVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
};
const rowItem = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const stepListVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const stepItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

function fmt(n: number) {
  return '$' + Number(n).toLocaleString();
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function PersonalizedClient({ link }: { link: PersonalizedLink }) {
  const [showChat, setShowChat] = useState(false);

  // Fire-and-forget — notifies DCC that the homeowner responded.
  // Opens Lauren chat regardless of whether the POST succeeds.
  const handleYes = useCallback(() => {
    setShowChat(true);
    fetch('/api/s/respond', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: link.token }),
    }).catch(() => { /* non-critical */ });
  }, [link.token]);
  const hasSurplus = link.estimated_surplus_low && link.estimated_surplus_high;
  const surplusRange = hasSurplus
    ? `${fmt(link.estimated_surplus_low!)} – ${fmt(link.estimated_surplus_high!)}`
    : null;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      color: 'var(--cream)', fontFamily: 'var(--font)',
    }}>
      {/* Nav */}
      <nav style={{
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'rgba(5,17,31,.95)',
        backdropFilter: 'blur(12px)', zIndex: 100,
      }}>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-.02em' }}>
          RefundLocators
        </span>
        <a href="tel:+15135162306" style={{
          fontSize: 13, color: 'var(--gold)', textDecoration: 'none', fontWeight: 600,
        }}>
          (513) 516-2306
        </a>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 120px' }}>
        {/* Headline */}
        <motion.h1
          {...fadeUp(0.05)}
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800,
            letterSpacing: '-.03em', lineHeight: 1.15, marginBottom: 36,
            color: 'var(--cream)',
          }}
        >
          {link.first_name} — this is what we found.
        </motion.h1>

        {/* Case card — staggered data rows */}
        <motion.div
          {...fadeUp(0.18)}
          style={{
            border: '1px solid rgba(201,162,74,.3)',
            borderRadius: 6, padding: '28px 28px',
            background: 'rgba(201,162,74,.04)',
            marginBottom: 36,
          }}
        >
          {link.property_address && (
            <motion.p {...fadeUp(0.28)} style={{ fontSize: 15, color: 'var(--cream)', marginBottom: 20, lineHeight: 1.5 }}>
              Your property at{' '}
              <strong>{link.property_address}</strong>{' '}
              {link.sale_date ? `sold at a sheriff sale on ${formatDate(link.sale_date)}.` : 'was involved in a sheriff sale.'}
            </motion.p>
          )}

          <motion.table
            variants={rowVariants} initial="hidden" animate="show"
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}
          >
            <tbody>
              {link.sale_price && (
                <motion.tr variants={rowItem}>
                  <DataRow label="Sale price" value={fmt(link.sale_price)} asFragment />
                </motion.tr>
              )}
              {link.judgment_amount && (
                <motion.tr variants={rowItem}>
                  <DataRow label="Debt paid from sale" value={fmt(link.judgment_amount)} asFragment />
                </motion.tr>
              )}
              {surplusRange && (
                <motion.tr variants={rowItem}>
                  <DataRow label="Estimated surplus" value={surplusRange} highlight asFragment />
                </motion.tr>
              )}
              {link.county && (
                <motion.tr variants={rowItem}>
                  <DataRow label="Held by" value={`${link.county} County Clerk of Courts`} asFragment />
                </motion.tr>
              )}
            </tbody>
          </motion.table>

          {surplusRange && (
            <motion.p
              {...fadeUp(0.6)}
              style={{
                marginTop: 20, fontSize: 13, color: 'var(--cream-45)',
                lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: 16,
              }}
            >
              This money is sitting with the {link.county || 'county'} Clerk of Courts. It&apos;s yours — you just have to claim it. Most people don&apos;t know it exists. Many wait too long and lose it to the state after 5 years.
            </motion.p>
          )}
        </motion.div>

        {/* Process */}
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: 'var(--cream)' }}>
          What I'd like to do
        </h2>
        <motion.ol
          variants={stepListVariants} initial="hidden" animate="show"
          style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 36 }}
        >
          {[
            'Our attorney (Jeff Kalniz, Ohio Bar #0068927) files the motion with the court.',
            'You sign one agreement. No money up front.',
            `When the funds are released — usually 60–90 days — we take 20%. You get 80%.`,
            'If your case requires contested litigation, fee is 35%. You\'ll know that before you sign anything.',
          ].map((step, i) => (
            <motion.li key={i} variants={stepItem} style={{
              display: 'flex', gap: 16, marginBottom: 14, fontSize: 14,
              color: 'var(--cream-70)', lineHeight: 1.6,
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                border: '1px solid var(--gold)', color: 'var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1,
              }}>{i + 1}</span>
              {step}
            </motion.li>
          ))}
        </motion.ol>

        <p style={{ fontSize: 13, color: 'var(--cream-45)', marginBottom: 32, lineHeight: 1.6 }}>
          That's it. No hidden fees. No monthly charges. We pay the attorney out of our share.
        </p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.5)} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
          <motion.button
            onClick={handleYes}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{
              background: 'var(--gold)', color: 'var(--bg)', border: 'none',
              borderRadius: 4, padding: '14px 28px',
              font: '700 15px var(--font)', cursor: 'pointer',
              boxShadow: 'var(--shadow-gold)',
            }}
          >
            Yes — let&apos;s do it →
          </motion.button>
          <motion.button
            onClick={() => setShowChat(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{
              background: 'transparent', color: 'var(--cream-70)',
              border: '1px solid var(--border)', borderRadius: 4,
              padding: '14px 28px', font: '500 15px var(--font)', cursor: 'pointer',
            }}
          >
            I have questions — chat with Lauren
          </motion.button>
        </motion.div>

        {/* Nathan contact */}
        <div style={{
          borderTop: '1px solid var(--border)', paddingTop: 32, marginBottom: 32,
        }}>
          <p style={{ fontSize: 14, color: 'var(--cream-45)', marginBottom: 12 }}>
            Prefer a phone call?
          </p>
          <p style={{ fontSize: 15, color: 'var(--cream)', fontWeight: 600 }}>
            Nathan Johnson (CEO)
          </p>
          <a href="tel:+15135162306" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: 15 }}>
            (513) 516-2306
          </a>
          <p style={{ fontSize: 12, color: 'var(--cream-20)', marginTop: 4 }}>
            Text or call, Mon–Sat
          </p>
        </div>

        {/* Scam trust signal */}
        <div style={{
          background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '20px 22px',
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)', marginBottom: 8 }}>
            Worried this is a scam?
          </p>
          <p style={{ fontSize: 13, color: 'var(--cream-45)', lineHeight: 1.6, marginBottom: 0 }}>
            Every surplus recovery company contacts people like this. Here's how to tell us apart:{' '}
            we name our attorney (Jeff Kalniz, Ohio Bar #0068927), publish our exact fee (20%), and{' '}
            don't charge you anything until funds are recovered. FundLocators LLC is a registered Ohio company.
          </p>
        </div>

        {/* Lauren chat — opens inline when CTA clicked */}
        {showChat && (
          <div style={{ marginTop: 48 }}>
            <LaurenChat
              personalizationContext={`This user is ${link.first_name}${link.last_name ? ' ' + link.last_name : ''}. Their property was ${link.property_address || 'an Ohio property'}. ${link.sale_date ? `It sold at sheriff sale on ${formatDate(link.sale_date)}.` : ''} ${surplusRange ? `Estimated surplus: ${surplusRange}.` : ''} Nathan texted them this link. Greet them by first name.`}
              greeting={`Hi ${link.first_name} — Nathan asked me to help you out. ${link.property_address ? `I see you had a sale at ${link.property_address}${link.sale_date ? ` back in ${new Date(link.sale_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : ''}.` : ''} Before we get into it: I'm an AI, and while I can walk you through the surplus recovery process, anything legal goes through our attorney. Want me to start with what the county is holding, or do you have a specific question?`}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: '20px 24px',
        textAlign: 'center', fontSize: 11, color: 'var(--cream-20)',
      }}>
        FundLocators LLC is a private company, not a government agency. This is not legal advice. Surplus amounts are estimates only.{' '}
        <a href="/privacy" style={{ color: 'var(--cream-20)' }}>Privacy</a>
        {' · '}
        <a href="/terms" style={{ color: 'var(--cream-20)' }}>Terms</a>
      </div>
    </div>
  );
}

function DataRow({ label, value, highlight, asFragment }: { label: string; value: string; highlight?: boolean; asFragment?: boolean }) {
  const cells = (
    <>
      <td style={{ padding: '6px 0', color: 'var(--cream-45)', width: '50%' }}>{label}</td>
      <td style={{
        padding: '6px 0',
        color: highlight ? 'var(--gold)' : 'var(--cream)',
        fontWeight: highlight ? 700 : 400,
        fontFamily: highlight ? 'var(--mono)' : 'inherit',
      }}>{value}</td>
    </>
  );
  if (asFragment) return cells;
  return <tr>{cells}</tr>;
}
