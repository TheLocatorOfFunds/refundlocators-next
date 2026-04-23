'use client';

/**
 * ScrollRevealText — Apple-style sticky scroll section.
 * 350vh container. Inner panel pins to top for 250vh of user scrolling.
 * 6 lines reveal sequentially. Uses global scrollY + manual progress calc
 * because Framer Motion v12 useScroll({ target }) doesn't resolve the
 * sticky-element pattern reliably across all environments.
 */

import { useRef, useEffect } from 'react';
import { useScroll, motion, useMotionValue, type MotionValue } from 'framer-motion';

interface LineConfig {
  text: string;
  size: string;
  color: string;
  weight: number;
  letterSpacing?: string;
}

const LINES: LineConfig[] = [
  {
    text: 'When a foreclosed home sells at auction',
    size: 'clamp(20px, 2.8vw, 38px)',
    color: 'var(--cream-45)',
    weight: 400,
    letterSpacing: '-.01em',
  },
  {
    text: "for more than what's owed —",
    size: 'clamp(20px, 2.8vw, 38px)',
    color: 'var(--cream-45)',
    weight: 400,
    letterSpacing: '-.01em',
  },
  {
    text: 'the court keeps the difference.',
    size: 'clamp(20px, 2.8vw, 38px)',
    color: 'var(--cream-70)',
    weight: 500,
    letterSpacing: '-.015em',
  },
  {
    text: 'That money belongs to you.',
    size: 'clamp(30px, 4.5vw, 60px)',
    color: 'var(--cream)',
    weight: 900,
    letterSpacing: '-.04em',
  },
  {
    text: 'Most homeowners never know it exists.',
    size: 'clamp(17px, 2.4vw, 30px)',
    color: 'var(--cream-45)',
    weight: 400,
    letterSpacing: '-.005em',
  },
  {
    text: 'We find it. We recover it.',
    size: 'clamp(28px, 4vw, 52px)',
    color: 'var(--gold)',
    weight: 800,
    letterSpacing: '-.035em',
  },
];

// Each entry: [reveal-start, reveal-end] as fraction of section scroll progress.
// Container is 350vh; sticky releases when sectionProgress ≈ 0.71.
// Lines spread across 0.03 → 0.72 so all reveal while sticky is still pinned.
const LINE_RANGES: [number, number][] = [
  [0.03, 0.12],
  [0.16, 0.25],
  [0.29, 0.38],
  [0.42, 0.51],
  [0.55, 0.63],
  [0.65, 0.72],
];

interface AnimLineProps {
  scrollY: MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  range: [number, number];
  config: LineConfig;
}

function AnimLine({ scrollY, containerRef, range, config }: AnimLineProps) {
  const opacity = useMotionValue(0);
  const y = useMotionValue(32);

  useEffect(() => {
    const unsub = scrollY.on('change', (latest) => {
      const el = containerRef.current;
      if (!el) return;

      // getBoundingClientRect().top + scrollY = absolute top of section
      const rect = el.getBoundingClientRect();
      const sectionTop = rect.top + latest;
      const scrollRange = el.offsetHeight - window.innerHeight;
      if (scrollRange <= 0) return;

      // Section-relative progress [0, 1]
      const sectionProgress = (latest - sectionTop) / scrollRange;
      // Line-relative progress [0, 1]
      const [start, end] = range;
      const lineProgress = Math.max(0, Math.min(1, (sectionProgress - start) / (end - start)));

      opacity.set(lineProgress);
      y.set(32 * (1 - lineProgress));
    });
    return unsub;
  }, [scrollY, containerRef, range, opacity, y]);

  return (
    <motion.div style={{ opacity, y }}>
      <span
        style={{
          display: 'block',
          fontSize: config.size,
          fontWeight: config.weight,
          color: config.color,
          lineHeight: 1.2,
          letterSpacing: config.letterSpacing ?? '-.01em',
          marginBottom: config.weight >= 700 ? '0.65em' : '0.45em',
        }}
      >
        {config.text}
      </span>
    </motion.div>
  );
}

export default function ScrollRevealText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll(); // global window scroll — always reliable

  return (
    <div
      ref={containerRef}
      style={{ height: '350vh', position: 'relative' }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Looping background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.55,
          }}
        >
          <source src="/drawer.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlay — keeps text readable, gold envelope still glows through */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: [
              'linear-gradient(to bottom, var(--bg) 0%, transparent 18%, transparent 82%, var(--bg) 100%)',
              'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(5,17,31,.72) 100%)',
            ].join(', '),
            pointerEvents: 'none',
          }}
        />

        {/* Subtle gold radial behind text block */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(201,162,74,.07), transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 760,
            padding: '0 28px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {LINES.map((line, i) => (
            <AnimLine
              key={i}
              scrollY={scrollY}
              containerRef={containerRef}
              range={LINE_RANGES[i]}
              config={line}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
