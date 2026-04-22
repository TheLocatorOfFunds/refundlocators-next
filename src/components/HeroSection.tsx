'use client';

import { useRef } from 'react';
import HeroSearch from './HeroSearch';
import LaurenChat from './LaurenChat';
import RecoveryTicker from './RecoveryTicker';

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
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--gold)', background: 'var(--gold-bg)', border: '1px solid var(--border-g)',
          padding: '6px 14px', borderRadius: 'var(--r-pill)', marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          Surplus Fund Intelligence · Ohio
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5.5vw, 62px)', fontWeight: 900,
          lineHeight: 1.07, letterSpacing: '-.04em', color: 'var(--cream)',
          marginBottom: 18, maxWidth: 700, textAlign: 'center',
        }}>
          You lost a home in Ohio.<br />
          <span style={{ color: 'var(--gold)' }}>The bank may owe you money.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--cream-70)',
          maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.65, textAlign: 'center',
        }}>
          Type the property address. In 10 seconds we'll tell you if there's surplus waiting — and roughly how much.
        </p>

        <HeroSearch onChatOpen={handleChatOpen} />

        <RecoveryTicker />

        <p style={{ marginTop: 28, fontSize: 13, color: 'var(--cream-45)', textAlign: 'center' }}>
          Prefer to talk?{' '}
          <a href="tel:+15139518855" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
            Call Nathan
          </a>{' '}
          · CEO · Ohio-based
        </p>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: 'var(--cream-20)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase',
        }}>
          <span>scroll</span>
          <div style={{
            width: 1, height: 36,
            background: 'linear-gradient(to bottom, var(--cream-20), transparent)',
            animation: 'scroll-line 2s ease-in-out infinite',
          }} />
        </div>
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
            If your address didn't match, or you have questions first — Lauren reads Ohio court records in real time.
          </p>
        </div>
        <LaurenChat />
      </div>
    </>
  );
}
