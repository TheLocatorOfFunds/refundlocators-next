import type { MetadataRoute } from 'next';
import { COUNTIES } from '@/lib/counties';

/**
 * Programmatic sitemap — replaces /public/sitemap.xml.
 *
 * Contains:
 *  - homepage (priority 1.0)
 *  - founder story (priority 0.9 — high SEO value)
 *  - "is this legit?" anti-scam page (priority 0.8)
 *  - 88 county landing pages (priority 0.7 each)
 *  - privacy + terms (priority 0.3)
 *
 * The personalized /s/[token] pages are NOT sitemapped — they're
 * `robots: { index: false }` per-page anyway.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base    = 'https://refundlocators.com';
  const today   = new Date().toISOString().slice(0, 10);

  const counties = COUNTIES.map(c => ({
    url:        `${base}/ohio/${c.slug}`,
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority:   0.7,
  }));

  return [
    { url: `${base}/`,                lastModified: today, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/story`,           lastModified: today, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/is-this-legit`,   lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    ...counties,
    { url: `${base}/privacy`,         lastModified: today, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,           lastModified: today, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
