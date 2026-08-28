# Founder video — approved script + rules

Placement: the "A note from our founder" section on `/s/[token]` pages
(`FounderNote` in `src/app/s/[token]/PersonalizedClient.tsx`). The section
stays hidden until a video asset exists.

## Assets

Drop files in `public/s-assets/founder/`:

| File | Used for |
|---|---|
| `default.mp4` | Generic fallback — record this one first |
| `homeowner.mp4` `spouse.mp4` `child.mp4` `parent.mp4` `sibling.mp4` | Relationship-specific variants (matches `copy.ts` templates) |
| `<same name>.jpg` | Optional poster frame per video |

## Approved script (CEO + Nathan, 2026-08-25)

> "Hi — I'm Nathan, and I'm the one who sent you that text. I want to tell
> you why. When a house sells at a foreclosure auction for more than what's
> owed, there's money left over that belongs to the family — and most people
> are never told. There's a whole industry that watches for it and goes after
> that money hard. I built this company to do it honestly instead: nothing
> upfront, everything in writing, and if there's nothing there I'll tell you.
> That's it. Call me if you want to talk it through."

Relationship variants may adjust the opening beat ("your parent's home",
"your family's home") but must keep every rule below.

## Hard rules (Compliance holds veto over the final cut)

- **Real recordings of Nathan only.** No AI-generated, synthetic, or
  per-recipient customized video — this was decided (not deferred) on
  2026-08-25. Per-recipient personalization stays in the page **text**,
  which recipients can verify.
- **No fabricated hardship claim.** Nathan has NOT lost a home to
  foreclosure; the line "I lost a home too" may never appear (see the
  header comment in `src/app/story/StoryPage.tsx`).
- No fee percentages or dollar amounts (fee cap language lives on /terms only).
- No statement about the recipient's specific surplus or case.
- No promised outcome.
- Compliance reviews the final recording before the asset is uploaded.
