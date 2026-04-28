# RUNBOOK — operational responses

Quick-reference for breaking-glass during incidents. Live procedures, not background reading.

## Kill Lauren on `refundlocators.com`

Three paths, fastest first.

### Path 1 — Instant kill (60 sec, no code change)

If something is actively going wrong RIGHT NOW (Lauren saying something embarrassing, leaking data, being injected) — pause the Edge Function from the Supabase dashboard. **One click, instant, no redeploy.**

1. Open https://supabase.com/dashboard/project/rcfaashkfpurkvtmsmeb/functions
2. Click on `lauren-chat` (the public homeowner chat)
3. Click **⋯ More** → **Pause function** (or the equivalent toggle)
4. Confirm

Result: any new chat request to lauren-chat returns 503. The widget on refundlocators.com will display its built-in error fallback ("having connection issues, call Nathan at (513) 516-2306"). Existing in-flight conversations finish.

To restore: same place, **Resume**.

This is the right move during a real incident because it doesn't require knowing which Vercel project, which env var, or whether your laptop is open.

### Path 2 — Soft kill via env var (90 sec, includes friendly offline message)

Use this when you want Lauren disabled for a few hours / overnight / scheduled maintenance, with a helpful "we're offline, email us" message instead of an error.

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

### Path 3 — Full disable + DNS pull (last resort, ~5 min)

Only if Path 1 + Path 2 both fail and Lauren is doing something genuinely catastrophic. Take the entire `refundlocators.com` site offline by disabling the Vercel project.

1. https://vercel.com/thelocatoroffunds-projects/refundlocators-next/settings → scroll to bottom → **Pause Project**
2. Site returns Vercel maintenance page until you un-pause

This nukes ALL of `refundlocators.com`, not just Lauren — including the personalized lead pages at `/s/<token>`. Use only if Lauren is actively doing real damage and you can't pause her specifically.

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
