/**
 * /is-this-legit — public-service framing of the surplus recovery space.
 *
 * Strategy: own the anti-scam position nobody else in the category owns.
 * Doubles as SEO ranking against searches like "is surplus funds recovery
 * a scam" and as a one-click pre-emptive answer to the visitor's biggest
 * objection.
 */

import type { Metadata } from 'next';
import IsThisLegit from './IsThisLegit';
import '../s/[token]/pass.css';
import '../s/[token]/lauren-ai.css';

export const metadata: Metadata = {
  title:       'Is surplus funds recovery a scam? | RefundLocators',
  description: 'How to tell if a surplus funds recovery service is legit, what red flags to watch for, and how RefundLocators is built differently for Ohio homeowners.',
  alternates:  { canonical: 'https://refundlocators.com/is-this-legit' },
  openGraph:   {
    title:       'Is surplus funds recovery a scam?',
    description: 'A plain-English guide to telling the legit recovery services from the predatory ones.',
    url:         'https://refundlocators.com/is-this-legit',
    siteName:    'RefundLocators',
    type:        'article',
  },
};

export default function Page() {
  return <IsThisLegit />;
}
