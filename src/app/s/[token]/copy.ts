// Per-relationship copy templates for the /s/[token] surface.
//
// Per Nathan 2026-04-28: each contact on a deal gets their own URL,
// and the page + iMessage preview should speak to THEIR relationship to
// the case. Homeowner gets "you lost a home". Daughter gets "your
// parent's home was sold". Spouse gets "you and Richard". Etc.
//
// Single source of truth so the title, og:description, og:image
// headline, page hero, and CTA all stay aligned. To add a new
// relationship: add a key to TEMPLATES + add the value to the
// personalized_links_relationship_check constraint in SQL.

export type Relationship =
  | 'homeowner'
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'other';

export interface CopyInput {
  firstName: string | null;
  lastName: string | null;
  propertyAddress: string | null;
  county: string | null;
  /** Pre-formatted dollar amount, e.g. "$104,035". Null if surplus is unknown. */
  surplusFmt: string | null;
  relationship: Relationship;
}

export interface CopyBundle {
  /** <title> + og:title */
  title: string;
  /** og:description / meta description */
  description: string;
  /** Eyebrow pill on the OG image (uppercase, gold) */
  ogEyebrow: string;
  /** First headline line — white serif on both website hero and OG image */
  headlineWhite: string;
  /** Second headline line — gold serif on both surfaces */
  headlineGold: string;
  /** Body line under the headline */
  subtext: string;
  /** Primary CTA button label on the website */
  ctaLabel: string;
}

function fallbackName(first: string | null): string {
  return (first && first.trim()) || 'Hi';
}

function clean(s: string | null | undefined): string {
  return (s || '').trim();
}

export function copyFor(input: CopyInput): CopyBundle {
  const first = clean(input.firstName);
  const last = clean(input.lastName);
  const fullName = [first, last].filter(Boolean).join(' ') || 'Your case';
  const name = fallbackName(input.firstName);
  const addr = clean(input.propertyAddress);
  const county = clean(input.county);
  const $ = input.surplusFmt;

  const subtext = addr
    ? `${addr}${county ? ' · ' + county + ' County' : ''}. Held by the Clerk of Courts.`
    : `Type your address. We'll tell you if there's surplus waiting.`;

  const ogEyebrow = county
    ? `Surplus Fund Intelligence · ${county} County`
    : 'Surplus Fund Intelligence · Ohio';

  switch (input.relationship) {
    case 'spouse':
      return {
        title: $ ? `${fullName} — ${$} from your family's home` : `${fullName} — your family's case`,
        description: $ && addr
          ? `${addr} · ${county} County, OH. The Clerk of Courts is holding ${$} from your family's home.`
          : `Your family's foreclosure case in ${county || 'Ohio'} may have surplus owed back.`,
        ogEyebrow,
        headlineWhite: `${name}, your home was sold at auction.`,
        headlineGold: $ ? `${$} may be owed to your family.` : `Your family may be owed money.`,
        subtext,
        ctaLabel: $ ? `Start our ${$} claim` : 'Start our claim',
      };

    case 'child':
      return {
        title: $ ? `${fullName} — ${$} from your parent's home` : `${fullName} — your family's case`,
        description: $ && addr
          ? `Your parent's home at ${addr} sold at auction. The Clerk of Courts is holding ${$}.`
          : `Your parent's foreclosure case in ${county || 'Ohio'} may have surplus owed back to the family.`,
        ogEyebrow,
        headlineWhite: `${name}, your parent's home was sold.`,
        headlineGold: $ ? `${$} may now belong to your family.` : `Your family may be owed money.`,
        subtext,
        ctaLabel: $ ? `Open the ${$} claim` : 'Open the claim',
      };

    case 'parent':
      return {
        title: $ ? `${fullName} — ${$} from your child's home` : `${fullName} — your family's case`,
        description: $ && addr
          ? `Your child's home at ${addr} sold at auction. The Clerk of Courts is holding ${$}.`
          : `Your child's foreclosure case in ${county || 'Ohio'} may have surplus owed back to the family.`,
        ogEyebrow,
        headlineWhite: `${name}, your child's home was sold.`,
        headlineGold: $ ? `${$} may be available to claim.` : `Your family may be owed money.`,
        subtext,
        ctaLabel: $ ? `See the ${$} case` : 'See the case',
      };

    case 'sibling':
      return {
        title: $ ? `${fullName} — ${$} from your sibling's home` : `${fullName} — your family's case`,
        description: $ && addr
          ? `Your sibling's home at ${addr} sold at auction. The Clerk of Courts is holding ${$}.`
          : `Your sibling's foreclosure case in ${county || 'Ohio'} may have surplus unclaimed.`,
        ogEyebrow,
        headlineWhite: `${name}, your sibling's home was sold.`,
        headlineGold: $ ? `${$} may be unclaimed.` : `Money may be unclaimed.`,
        subtext,
        ctaLabel: $ ? `Help dig into the ${$}` : 'Help me dig in',
      };

    case 'other':
      return {
        title: $ ? `${fullName} — ${$} owed in your family's case` : `${fullName} — your family's case`,
        description: $ && addr
          ? `A foreclosure at ${addr} sold at auction. The Clerk of Courts is holding ${$}.`
          : `A foreclosure case in ${county || 'Ohio'} may have surplus tied to your family.`,
        ogEyebrow,
        headlineWhite: `${name}, this case may matter to your family.`,
        headlineGold: $ ? `${$} is at stake.` : `Money may be at stake.`,
        subtext,
        ctaLabel: $ ? `Look into the ${$}` : 'Look into it',
      };

    case 'homeowner':
    default:
      return {
        title: $ ? `${fullName} — ${$} surplus from your home` : `${fullName} — your foreclosure case`,
        description: $ && addr
          ? `${addr} · ${county} County, OH. The Clerk of Courts is holding ${$} for you.`
          : `${addr || 'Your case'} · ${county || 'OH'}. We've been tracking your case.`,
        ogEyebrow,
        headlineWhite: `${name}, you lost a home in Ohio.`,
        headlineGold: $ ? `${$} may be owed to you.` : `The bank may owe you money.`,
        subtext,
        ctaLabel: $ ? `File for my ${$}` : 'File my claim',
      };
  }
}
