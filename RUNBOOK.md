# RUNBOOK — operational responses

Quick-reference for breaking-glass during incidents. Live procedures, not background reading.

## Kill Lauren on `refundlocators.com`

> **Note 2026-04-28:** Supabase removed the "Pause function" feature from the Edge Functions UI. The dashboard now only offers Delete (irreversible) or JWT-toggle (auth, not a kill switch). So the working kill paths are below — the Vercel env var is now the PRIMARY path.

### Path 1 — Vercel env var kill-switch (PRIMARY, ~90 sec)

Soft-disables Lauren with a user-friendly offline message rendered client-side. The chat widget mounts but never calls the backend — every send replays the offline message.

```
cd ~/Documents/Claude/refundlocators-next
vercel env add NEXT_PUBLIC_LAUREN_DISABLED production
# When prompted, type: true
vercel --prod --yes
```

Once the deploy finishes (~60 sec), every page on refundlocators.com that uses the chat widget will render:

> "Lauren is temporarily offline. Please email hello@refundlocators.com or call (513) 516-2306 — we'll respond within one business day."

The user can still type, but every send replays the same offline message — no fetch to lauren-chat happens.

To restore:
```
vercel env rm NEXT_PUBLIC_LAUREN_DISABLED production
vercel --prod --yes
```

### Path 2 — Replace lauren-chat function with a 503 stub (~3 min, breaks gracefully on the backend)

Use this when Path 1 fails (Vercel down, build broken, etc).

1. Open https://supabase.com/dashboard/project/rcfaashkfpurkvtmsmeb/functions/lauren-chat → **Code** tab
2. **Click Download** (top-right) FIRST to save current source — restore artifact
3. Replace the entire body inside `Deno.serve(...)` with:
   ```typescript
   Deno.serve(() => new Response(
     JSON.stringify({ reply: "Lauren is offline for maintenance. Please email hello@refundlocators.com — we'll respond within 1 business day." }),
     { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
   ));
   ```
4. Click **Deploy**

To restore: paste the saved source back → Deploy.

### Path 3 — Full disable + DNS pull (last resort, ~5 min)

Only if Paths 1 + 2 both fail and Lauren is doing something genuinely catastrophic. Take the entire `refundlocators.com` site offline by disabling the Vercel project.

1. https://vercel.com/thelocatoroffunds-projects/refundlocators-next/settings → scroll to bottom → **Pause Project**
2. Site returns Vercel maintenance page until you un-pause

This nukes ALL of `refundlocators.com`, not just Lauren — including the personalized lead pages at `/s/<token>`. Use only if Lauren is actively doing real damage and you can't kill her specifically.

### Path 4 — Delete the Edge Function (irreversible without source backup)

Last-resort, drastic. From the lauren-chat Settings tab → **Delete edge function**. This breaks the chat permanently until someone re-deploys from saved source.

⚠️ **lauren-chat source isn't in git** (deployed directly to Supabase). Before clicking delete, you MUST first download the source via the function's Code tab → Download button. Otherwise restoring requires Justin to rewrite from scratch.

This is here for completeness; you should never need it.

---

## After the incident — what to log

For any of the three paths above, write a one-liner in `WORKING_ON.md` (DCC repo) or this file's "Recent incidents" section so the next session knows:

- When you killed her
- Why (paste the offending message if applicable)
- Which path you used
- Whether/when she's been restored
- What's still investigating

## Recent incidents

(none yet — this section gets filled in as things happen)

---

## Related

- `DEPLOY.md` — how Vercel deploys work in this repo (auto + manual paths)
- `JUSTIN_LAUREN_PROMPT_INJECTION_HARDENING.md` (DCC repo) — long-term hardening plan that reduces how often we ever need this runbook
