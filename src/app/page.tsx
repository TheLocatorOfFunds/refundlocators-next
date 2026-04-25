/**
 * Homepage — design-aligned salvage page.
 *
 * Anyone landing here typed the URL or clicked through Google (no token).
 * One screen, one job: get them to type their former address (warm path)
 * or text Nathan (warmer path). Everything else moved to /how-it-works
 * and /why-us as secondary pages we may build later.
 *
 * Uses the same pass.css design system as /s/[token] so the brand reads
 * identically across both surfaces.
 */

import HomeClient from './HomeClient';
import './s/[token]/pass.css';

export default function Home() {
  return <HomeClient />;
}
