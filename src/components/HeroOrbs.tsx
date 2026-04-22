'use client';

import { useEffect, useRef } from 'react';

export default function HeroOrbs() {
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const orb3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (orb1.current) orb1.current.style.transform = `translateY(${y * 0.25}px)`;
          if (orb2.current) orb2.current.style.transform = `translateY(${y * 0.15}px)`;
          if (orb3.current) orb3.current.style.transform = `translate(-50%, calc(-50% + ${y * 0.35}px))`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div ref={orb1} style={{
        position: 'absolute', width: 700, height: 500, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(201,162,74,.17) 0%, transparent 70%)',
        filter: 'blur(90px)', top: -120, right: -180,
        animation: 'drift1 20s ease-in-out infinite alternate',
      }} />
      <div ref={orb2} style={{
        position: 'absolute', width: 500, height: 620, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(26,58,92,.55) 0%, transparent 70%)',
        filter: 'blur(90px)', bottom: -100, left: -120,
        animation: 'drift2 24s ease-in-out infinite alternate',
      }} />
      <div ref={orb3} style={{
        position: 'absolute', width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(201,162,74,.09) 0%, transparent 70%)',
        filter: 'blur(80px)', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'drift3 16s ease-in-out infinite alternate',
      }} />
    </div>
  );
}
