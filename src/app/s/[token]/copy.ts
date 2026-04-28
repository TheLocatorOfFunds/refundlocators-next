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
  /**
   * Hero context line on the rendered page — the empathetic factual lead-in
   * above the dollar amount. Split around the bolded phrase so each
   * relationship can phrase the bold beat differently.
   */
  pageContext: { lead: string; bold: string; trail: string };
  /** Empathy section body paragraphs (rendered as <p>'s in order). */
  pageEmpathy: string[];
  /**
   * Closing paragraph in the empathy section — the inline "one click"
   * link is rendered between `lead` and `trail` and triggers the claim
   * modal.
   */
  pageEmpathyClose: { lead: string; trail: string };
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

  const countyClerk = county ? `${county} County Clerk` : 'County Clerk';
  const countyOffice = county ? `${county} County Clerk's office` : "County Clerk's office";

  // Shared "process explanation" paragraph used in the empathy section
  // for every relationship — the underlying mechanic of how surplus
  // gets stranded is the same regardless of who's reading.
  const processPara = `Here's what most families aren't told: when a home sells for more than the debt, the leftover money — the surplus — sits at the ${countyOffice}. The county is required to send only one certified letter, usually to the foreclosed address no one lives at anymore.`;

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
        pageContext: {
          lead: 'Your home was recently sold at a sheriff’s sale. We believe it sold for ',
          bold: 'more than what was owed',
          trail: ` — and that extra money may belong to your family, held by the ${countyClerk}.`,
        },
        pageEmpathy: [
          'Losing your home is hard. We know that, and we don’t take it lightly.',
          processPara,
          'If no one claims it within the window, the money quietly stays with the county. Many families lose what’s rightfully theirs simply because they were never told.',
        ],
        pageEmpathyClose: {
          lead: 'That’s why we read the public court records and reach out to family directly — to make sure you know, and to make it as easy as ',
          trail: ' for your family to get it.',
        },
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
        pageContext: {
          lead: 'Your parent’s home was recently sold at a sheriff’s sale. We believe it sold for ',
          bold: 'more than what was owed',
          trail: ` — and that extra money may belong to your family, held by the ${countyClerk}.`,
        },
        pageEmpathy: [
          'Watching a parent go through this is hard. We know that, and we don’t take it lightly.',
          processPara,
          'If no one claims it within the window, the money quietly stays with the county. Many families lose what’s rightfully theirs simply because they were never told. If there’s a probate situation or other complications, we can help navigate that too.',
        ],
        pageEmpathyClose: {
          lead: 'That’s why we read the public court records and reach out to family — to make sure you know, and to make it as easy as ',
          trail: ' for you to help your family get it.',
        },
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
        pageContext: {
          lead: 'Your child’s home was recently sold at a sheriff’s sale. We believe it sold for ',
          bold: 'more than what was owed',
          trail: ` — and that extra money may belong to your family, held by the ${countyClerk}.`,
        },
        pageEmpathy: [
          'Watching your child go through this is hard. We know that, and we don’t take it lightly.',
          processPara,
          'If no one claims it within the window, the money quietly stays with the county. Many families lose what’s rightfully theirs simply because they were never told.',
        ],
        pageEmpathyClose: {
          lead: 'That’s why we read the public court records and reach out to family — to make sure you know, and to make it as easy as ',
          trail: ' for your family to get it.',
        },
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
        pageContext: {
          lead: 'Your sibling’s home was recently sold at a sheriff’s sale. We believe it sold for ',
          bold: 'more than what was owed',
          trail: ` — and that extra money may be unclaimed, held by the ${countyClerk}.`,
        },
        pageEmpathy: [
          'Watching family go through this is hard. We know that, and we don’t take it lightly.',
          processPara,
          'If no one claims it within the window, the money quietly stays with the county. Many families lose what’s rightfully theirs simply because they were never told.',
        ],
        pageEmpathyClose: {
          lead: 'That’s why we read the public court records and reach out to family — to make sure you know, and to make it as easy as ',
          trail: ' for your family to get it.',
        },
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
        pageContext: {
          lead: 'A home connected to your family was recently sold at a sheriff’s sale. We believe it sold for ',
          bold: 'more than what was owed',
          trail: ` — and that extra money may be at stake, held by the ${countyClerk}.`,
        },
        pageEmpathy: [
          'These cases are hard. We know that, and we don’t take it lightly.',
          processPara,
          'If no one claims it within the window, the money quietly stays with the county. Many families lose what’s rightfully theirs simply because they were never told.',
        ],
        pageEmpathyClose: {
          lead: 'That’s why we read the public court records and reach out to family directly — to make sure you know, and to make it as easy as ',
          trail: ' for your family to get it.',
        },
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
        pageContext: {
          lead: 'Your home was recently sold at a sheriff’s sale. We believe it sold for ',
          bold: 'more than what you owed',
          trail: ` — and that extra money belongs to you, held by the ${countyClerk}.`,
        },
        pageEmpathy: [
          'Losing a home is hard. We know that, and we don’t take it lightly.',
          `Here’s what most people aren’t told: when a home sells for more than the debt, the leftover money — the surplus — sits at the ${countyOffice}. The county is required to send only one certified letter, usually to the foreclosed address the family no longer lives at.`,
          'If no one claims it within the window, the money quietly stays with the county. Many families lose what’s rightfully theirs simply because they were never told.',
        ],
        pageEmpathyClose: {
          lead: 'That’s why we read the public court records and reach out directly — to make sure you know, and to make it as easy as ',
          trail: ' for you to get it.',
        },
      };
  }
}
