'use client';

import { useRef, useEffect, useState } from 'react';

function StatCounter({ target, prefix = '', suffix = '', abbr = false }: {
  target: number; prefix?: string; suffix?: string; abbr?: boolean;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const dur = 1800;
      let startTime: number | null = null;
      const step = (ts: number) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / dur, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        setVal(current);
        if (progress < 1) requestAnimationFrame(step);
        else setVal(target);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const display = abbr && val >= 1000 ? `$${(val / 1000).toFixed(0)}K` : val.toLocaleString();

  return (
    <span ref={ref} style={{ fontFamily: 'var(--mono)' }}>
      {prefix}{display}{suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 80,
    }}>
      {[
        { target: 7, suffix: ' days', label: 'to file your claim' },
        { target: 47000, label: 'avg Ohio surplus', abbr: true },
        { target: 25, suffix: '%', label: 'fee · zero upfront' },
      ].map((s, i) => (
        <>
          {i > 0 && <div key={`div-${i}`} style={{ width: 1, background: 'var(--border)', flexShrink: 0 }} />}
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-.04em', color: 'var(--cream)' }}>
              <StatCounter target={s.target} suffix={s.suffix} abbr={s.abbr} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--cream-45)', marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        </>
      ))}
    </div>
  );
}
