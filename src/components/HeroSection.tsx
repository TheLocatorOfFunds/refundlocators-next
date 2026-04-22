'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import HeroSearch from './HeroSearch';
import LaurenChat from './LaurenChat';
import RecoveryTicker from './RecoveryTicker';

// Shared fade+slide variant factory
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
});

export default function HeroSection() {
  const chatRef = useRef<HTMLDivElement>(null);

  const handleChatOpen = () => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* ── Address search hero ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 20px 80px',
      }}>

        {/* Eyebrow — first in */}
        <motion.div
          {...fadeUp(0.05)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--gold)', background: 'var(--gold-bg)', border: '1px solid var(--border-g)',
            padding: '6px 14px', borderRadius: 'var(--r-pill)', marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          Surplus Fund Intelligence · Ohio
        </motion.div>

        {/* H1 line 1 */}
        <motion.h1
          style={{
            fontSize: 'clamp(32px, 5.5vw, 62px)', fontWeight: 900,
            lineHeight: 1.07, letterSpacing: '-.04em', color: 'var(--cream)',
            marginBottom: 18, maxWidth: 700, textAlign: 'center',
          }}
        >
          <motion.span
            {...fadeUp(0.18)}
            style={{ display: 'block' }}
          >
            You lost a home in Ohio.
          </motion.span>
          <motion.span
            {...fadeUp(0.30)}
            style={{ display: 'block', color: 'var(--gold)' }}
          >
            The bank may owe you money.
          </motion.span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          {...fadeUp(0.44)}
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--cream-70)',
            maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.65, textAlign: 'center',
          }}
        >
          Type the property address. In 10 seconds we&apos;ll tell you if there&apos;s surplus waiting — and roughly how much.
        </motion.p>

        {/* Search box */}
        <motion.div
          {...fadeUp(0.58)}
          style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <HeroSearch onChatOpen={handleChatOpen} />
        </motion.div>

        {/* Recovery ticker */}
        <motion.div {...fadeUp(0.74)} style={{ width: '100%', maxWidth: 640 }}>
          <RecoveryTicker />
        </motion.div>

        {/* Call Nathan */}
        <motion.p
          {...fadeUp(0.84)}
          style={{ marginTop: 28, fontSize: 13, color: 'var(--cream-45)', textAlign: 'center' }}
        >
          Prefer to talk?{' '}
          <a href="tel:+15135162306" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
            Call Nathan
          </a>{' '}
          · CEO · Ohio-based
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          style={{
            position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            color: 'var(--cream-20)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase',
          }}
        >
          <span>scroll</span>
          <div style={{
            width: 1, height: 36,
            background: 'linear-gradient(to bottom, var(--cream-20), transparent)',
            animation: 'scroll-line 2s ease-in-out infinite',
          }} />
        </motion.div>
      </section>

      {/* ── Lauren chat (below fold, scroll target) ── */}
      <div ref={chatRef} style={{
        position: 'relative', zIndex: 1,
        maxWidth: 720, margin: '0 auto', padding: '0 20px 80px',
        scrollMarginTop: 80,
      }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            Or just ask Lauren
          </span>
          <p style={{ fontSize: 14, color: 'var(--cream-45)', marginTop: 6 }}>
            If your address didn&apos;t match, or you have questions first — Lauren reads Ohio court records in real time.
          </p>
        </div>
        <LaurenChat />
      </div>
    </>
  );
}
