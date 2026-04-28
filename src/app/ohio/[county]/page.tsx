/**
 * Ohio county landing pages — /ohio/{slug}
 *
 * Pre-rendered for all 88 counties at build time. Each page is unique
 * (county name + county seat + clerk-of-courts link), giving us 88
 * indexable pages with real local content for SEO. Florida Claim
 * Solutions does this for FL counties; no Ohio competitor does.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COUNTIES, findCounty, clerkSearchUrl } from '@/lib/counties';
import CountyClient from './CountyClient';
import '../../s/[token]/pass.css';
import '../../s/[token]/lauren-ai.css';

interface Props { params: Promise<{ county: string }> }

// Generate one route per county at build time → 88 static pages
export function generateStaticParams() {
  return COUNTIES.map(c => ({ county: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { county } = await params;
  const c = findCounty(county);
  if (!c) return { title: 'Not found · RefundLocators' };
  return {
    title:       `${c.name} County, Ohio Surplus Funds Recovery | RefundLocators`,
    description: `Lost a home in ${c.name} County, Ohio? The county clerk in ${c.seat} may be holding surplus funds from your sheriff's sale. Check your address in 10 seconds — free, no signup, attorney-filed.`,
    alternates:  { canonical: `https://refundlocators.com/ohio/${c.slug}` },
    openGraph:   {
      title:       `${c.name} County, Ohio surplus funds`,
      description: `If your home went to sheriff's sale in ${c.name} County, you may be owed surplus money still held by the clerk.`,
      url:         `https://refundlocators.com/ohio/${c.slug}`,
      siteName:    'RefundLocators',
      type:        'website',
    },
  };
}

export default async function CountyPage({ params }: Props) {
  const { county } = await params;
  const c = findCounty(county);
  if (!c) return notFound();

  return (
    <CountyClient
      countyName={c.name}
      countySeat={c.seat}
      clerkUrl={clerkSearchUrl(c)}
      hasVerifiedClerk={Boolean(c.clerkUrl)}
    />
  );
}
