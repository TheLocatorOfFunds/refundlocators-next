'use client';

/**
 * TiltCard — 3-D mouse-follow tilt wrapper.
 * Tracks cursor position within the card, tilts up to `maxTilt` degrees.
 * Spring-physics snap-back on mouse leave. Works as a drop-in wrapper.
 */

import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  maxTilt?: number;
}

export default function TiltCard({ children, style, maxTilt = 5 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const rawRotX = useMotionValue(0);
  const rawRotY = useMotionValue(0);

  const rotateX = useSpring(rawRotX, { stiffness: 280, damping: 28, mass: 0.6 });
  const rotateY = useSpring(rawRotY, { stiffness: 280, damping: 28, mass: 0.6 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Normalised offset from centre: –1 → 1
    const nx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const ny = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    rawRotY.set( nx * maxTilt);
    rawRotX.set(-ny * maxTilt);
  };

  const handleMouseLeave = () => {
    rawRotX.set(0);
    rawRotY.set(0);
  };

  return (
    // Perspective wrapper — must be separate from the rotating element
    <div style={{ perspective: '900px', ...style }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          height: '100%',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
