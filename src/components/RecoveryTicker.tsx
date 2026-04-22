'use client';

import { useEffect, useState, useRef } from 'react';

interface TickerData {
  total: number;
  count: number;
  last: { amount: number; county: string; recovered_at: string; display_name: string | null } | null;
}

function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || started.current || target === 0) return;
    const el = ref.current;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      let startTime: number | null = null;
      const step = (ts: number) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setVal(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(step);
        else setVal(target);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, val };
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / 86400000);
}

export default function RecoveryTicker() {
  const [data, setData] = useState<TickerData | null>(null);
  const { ref, val } = useCountUp(data?.total ?? 0);

  useEffect(() => {
    fetch('/api/ticker')
      .then(r => r.json())
      .then(setData)
      .catch(() => null);
  }, []);

  if (!data) return null;

  const days = data.last ? daysSince(data.last.recovered_at) : null;

  return (
    <div style={{
      fontSize: 13, color: 'var(--cream-45)', lineHeight: 1.7,
      marginTop: 18,
    }}>
      <span ref={ref} style={{ color: 'var(--gold)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
        ${val.toLocaleString()}
      </span>
      {' '}returned to Ohio homeowners so far.
      {data.last && days !== null && (
        <>
          {' '}Last recovery:{' '}
          <span style={{ color: 'var(--cream-70)' }}>
            {days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`}
            {', '}{data.last.county} County
            {', '}{data.last.display_name ? `${data.last.display_name}, ` : ''}
            <span style={{ color: 'var(--gold)', fontFamily: 'var(--mono)' }}>
              ${Number(data.last.amount).toLocaleString()}
            </span>
          </span>
        </>
      )}
    </div>
  );
}
