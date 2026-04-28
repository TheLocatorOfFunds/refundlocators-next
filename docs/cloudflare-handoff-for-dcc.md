# Cloudflare — Handoff Doc for the DCC Agent

Everything I know about Nathan's Cloudflare stack and what's worth
considering. Some of this is verified about his specific account; most
of it is general Cloudflare product knowledge applied to his use case.
Sections marked **CONFIRMED** are things I verified by network probe.

---

## 1. Current state — CONFIRMED

### DNS

Nathan's domains use Cloudflare as the **DNS authority**:

```
refundlocators.com → faye.ns.cloudflare.com + andronicus.ns.cloudflare.com
```

Likely the same setup for `fundlocators.com` and `defenderfunds.com`
(or whatever the third brand domain is) — the DCC agent should verify
by running:

```bash
dig NS fundlocators.com +short
dig NS defenderfunds.com +short
```

### CDN / proxying — NOT IN USE

Cloudflare is **DNS-only** for refundlocators.com — the orange-cloud
proxy is OFF. Verified by the absence of `cf-ray` and `cf-cache-status`
headers in the response, and presence of `server: Vercel` and
`x-vercel-cache: HIT`. Visitor traffic flows:

```
Browser → Cloudflare DNS lookup → direct to Vercel edge → origin (Vercel)
```

No Cloudflare WAF, no Cloudflare CDN, no Cloudflare DDoS protection
sitting in front of the website. **Don't turn on the orange cloud** —
double-CDNing in front of Vercel causes cache rule conflicts, weird
SSL behavior, and zero performance benefit (Vercel's edge is already
global).

### What we do NOT use today

Inferred from "DNS only" status — none of these are active for the
public website:

- Cloudflare R2 (object storage)
- Cloudflare Workers (edge compute)
- Cloudflare Pages (static hosting)
- Cloudflare Stream (video hosting)
- Cloudflare Tunnel
- Cloudflare Email Routing
- Cloudflare Workers AI
- Cloudflare Turnstile (CAPTCHA)
- Cloudflare Analytics
- Cloudflare Access / Zero Trust

---

## 2. Cloudflare product catalog — relevance ranking for FundLocators

Ranked by how useful each product would actually be in the FundLocators
stack. Pricing is current as of 2026.

### TIER 1 — strongly recommended to adopt

#### Cloudflare R2 (object storage)

**What it is:** S3-compatible object storage with **zero egress fees**.

**Why it matters for you:**
- DCC asset storage (uploaded check images, exported reports, logos)
- Future HeyGen-generated personalized videos
- Backup storage for Supabase exports
- Property photos cached from Google Street View (we currently re-fetch
  every time a token is loaded; R2 would cut Maps API costs ~80%)

**Pricing:**
- $0.015 per GB-month storage
- $0.36 per million Class A operations (writes)
- $0.0036 per million Class B operations (reads)
- **$0 egress** — biggest differentiator vs S3/Vercel Blob

At FundLocators scale: probably under **$2/month** for everything for
the foreseeable future.

**Setup path:**
1. Cloudflare dashboard → R2 → Create bucket
2. Generate R2 API token (Account > R2 > Manage R2 API Tokens)
3. Use the AWS S3 SDK with R2 endpoint:
   `https://{ACCOUNT_ID}.r2.cloudflarestorage.com`
4. From Vercel: add `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
   `R2_ACCOUNT_ID`, `R2_BUCKET` env vars

#### Cloudflare Workers (edge compute)

**What it is:** Serverless functions that run on Cloudflare's edge
network (300+ cities, sub-50ms cold start globally).

**Why it matters for you:**
- Cheap rate-limiting in front of public endpoints (currently
  `/api/search` uses an in-memory per-instance limit which doesn't
  actually work on Vercel's serverless model)
- IDI Core API proxy — hide credentials, cache lookups, retry logic
- Request signing for Twilio webhooks
- Could host the entire DCC if migrating off GitHub Pages

**Pricing:**
- Free tier: 100k requests/day
- Paid: $5/month for 10M requests + $0.50 per additional million
- Workers KV (key-value store): $5/month for 10M reads, $0.50/million writes

For your scale, you'd live in the free tier indefinitely unless you
proxy IDI lookups through Workers (which would still be under $10/month).

**Setup path:**
1. `npm install -g wrangler`
2. `wrangler login`
3. `wrangler init <worker-name>` → write the handler
4. `wrangler deploy`
5. Worker is live at `https://<worker-name>.<your-account>.workers.dev`
   or attach to a custom subdomain like `api.fundlocators.com`

#### Cloudflare Pages (static hosting)

**What it is:** Next-gen static-site hosting with Git integration.
Direct competitor to Vercel and GitHub Pages.

**Why it matters for you:**
- The DCC currently auto-deploys to GitHub Pages. **Cloudflare Pages
  would be a strict upgrade**: faster builds, better edge caching,
  built-in functions (Workers), preview deployments per branch, custom
  domains with auto-SSL, and zero-config global CDN.
- Free tier: unlimited bandwidth, unlimited requests, 500 builds/month,
  20k files per deploy, 25 MB max file size.

**Setup path for the DCC:**
1. Connect the DCC GitHub repo to Cloudflare Pages
2. Build command: none (single-file HTML deploys as-is)
3. Output directory: `/` (or wherever the HTML lives)
4. Custom domain: `dcc.fundlocators.com` → Cloudflare Pages
5. GitHub Pages can stay live during cutover; just flip the DNS when
   ready

This is the single most concrete cleanup the DCC could do today —
GitHub Pages is fine for an MVP but Cloudflare Pages gives you preview
deployments per PR, faster CDN, and integration with R2 / Workers /
Turnstile if you ever need them.

### TIER 2 — worth adopting selectively

#### Cloudflare Turnstile (CAPTCHA replacement)

**What it is:** Privacy-preserving CAPTCHA that shows a checkbox (or
runs invisibly) instead of "click all the buses."

**Why it matters for you:**
- The `/api/search` endpoint has no abuse protection beyond rate
  limiting. A motivated attacker could spam it from rotating IPs.
- The Lauren chat costs API money per message — currently anyone could
  hammer it.
- Adding Turnstile to the address search and Lauren chat would cut
  abuse without adding friction for real users.

**Pricing:** Free for unlimited users.

**Setup:** Add a `<div data-sitekey="...">` to the search form, verify
the token server-side via a single fetch to Cloudflare's siteverify
endpoint. ~30 minutes to add.

#### Cloudflare Email Routing

**What it is:** Free email forwarding for custom domains.

**Why it matters for you:**
- `nathan@fundlocators.com` and `lauren@fundlocators.com` and any
  other email on your domains → forwarded to your real Gmail (or
  wherever).
- Currently you have nothing here as far as I know — your only listed
  contact is your cell.
- Having a real `nathan@refundlocators.com` address makes the SMS
  outreach + claim form follow-ups feel less ad-hoc.

**Pricing:** Free, unlimited rules.

**Setup:** Cloudflare dashboard → Email → Routing → enable, add MX
records (one click), create rules.

#### Cloudflare Analytics (Web Analytics)

**What it is:** Free privacy-respecting analytics. No cookies, no PII.

**Why it matters for you:**
- Vercel Analytics is free up to 2,500 events/month then ramps quickly
- Cloudflare Web Analytics is free at any volume
- More importantly: **you can run both in parallel** — Vercel for
  conversion / route tracking, Cloudflare for top-of-funnel + bot
  detection.

**Pricing:** Free.

**Setup:** One JS snippet in `<head>`. Or zero-config if you front the
site with Cloudflare proxy (which we said don't do — so JS snippet).

### TIER 3 — interesting but speculative

#### Cloudflare Stream (video hosting)

**Relevant only if** the HeyGen-personalized-video moonshot ships.
Stream handles upload, encoding, adaptive bitrate, and CDN delivery in
one product. ~$1 per 1k minutes streamed + $5 per 1k minutes stored.
Cheaper than self-hosting on R2 + ffmpeg if videos hit any volume.

#### Cloudflare Workers AI

**Relevant only if** you want a cheaper Lauren backend. Workers AI
gives you Llama 3, Mistral, and other open-source models hosted on
Cloudflare's GPUs at ~$0.011 per 1k tokens. Currently your Lauren
runs on a Supabase Edge Function (presumably calling Anthropic or
OpenAI). Switching to Workers AI would cut per-message cost ~5-10x but
quality is meaningfully lower. Consider only when message volume justifies
the trade-off.

#### Cloudflare Tunnel (Argo Tunnel / cloudflared)

**Relevant only if** you want to expose a local dev environment to the
internet without opening firewall ports. Useful for testing webhooks
during dev. Not relevant for production.

#### Cloudflare Access / Zero Trust

**Relevant only if** the DCC ever has multiple users with different
permission levels. Adds Google/GitHub SSO + per-user access policies in
front of your admin URLs. Free for up to 50 users. Right now you have
one user (Nathan) with a single password — overkill until you hire.

### TIER 4 — do not bother

- **Cloudflare for SaaS** (custom hostnames for your customers — not your model)
- **Cloudflare Argo Smart Routing** (paid premium routing — Vercel's already global)
- **Cloudflare Magic Transit** (enterprise DDoS — wildly overkill)
- **Cloudflare Spectrum** (TCP/UDP proxy — not relevant)

---

## 3. Programmatic access — Cloudflare API

The DCC agent will need API credentials to do anything programmatic.

### Authentication options

**Option A: API Token (recommended)** — scoped to specific permissions
and zones. Best practice.

1. Cloudflare dashboard → My Profile → API Tokens → Create Token
2. Use template "Edit zone DNS" (or build a custom one with only the
   permissions needed)
3. Scope to specific zones (only `fundlocators.com`, etc.) for safety
4. Save the token in 1Password / Vercel env / wherever

**Option B: Global API Key (do not use unless required)** — full
account access. Old-style auth, easy to leak.

### Useful API endpoints

```
# List all zones in the account
GET https://api.cloudflare.com/client/v4/zones

# List DNS records for a zone
GET https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records

# Create / update / delete DNS records
POST/PUT/DELETE https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records[/{id}]

# Purge cache for a zone (useful when proxy is on; harmless when off)
POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache

# R2 buckets
GET/POST https://api.cloudflare.com/client/v4/accounts/{account_id}/r2/buckets

# Workers
PUT https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{name}
```

All requests require:
```
Authorization: Bearer {API_TOKEN}
Content-Type: application/json
```

### Account ID

Found in the Cloudflare dashboard URL when you're logged in:
`https://dash.cloudflare.com/{ACCOUNT_ID}/...`

The DCC agent will need this for any account-scoped operation (R2,
Workers, etc.). Zone-scoped operations only need the zone ID.

---

## 4. Specific recommended uses for FundLocators

In priority order, here's what I'd actually do with Cloudflare:

### IMMEDIATE (do this week)

1. **Migrate the DCC from GitHub Pages to Cloudflare Pages.** ~1 hour
   of setup, immediate quality-of-life upgrade (preview deploys per
   PR, faster builds, better edge). Custom domain `dcc.fundlocators.com`.

2. **Enable Cloudflare Email Routing.** ~10 minutes. Get
   `nathan@refundlocators.com` and `nathan@fundlocators.com` forwarded
   to your real inbox. Looks more professional in any email follow-up.

### SHORT-TERM (do this month)

3. **R2 bucket for asset storage.** Set up `fundlocators-assets` bucket
   for: check photos (when you have real ones), exported reports,
   logos, brand assets, future Street View image cache. Estimated cost:
   under $2/month.

4. **Add Turnstile to public endpoints.** Address search + Lauren chat
   on refundlocators.com. ~30 minutes per endpoint. Cuts abuse risk
   significantly without adding user friction.

5. **Cache Street View images in R2.** Currently every personalized
   page load costs us a Street View API call ($7 per 1k). Caching them
   in R2 cuts the cost ~80% (most addresses get loaded multiple times
   by the same person).

### MEDIUM-TERM (do this quarter)

6. **Workers proxy for IDI Core lookups.** Hide the IDI credentials
   from Castle (they currently sit in Castle's `.env`), add caching
   (no point looking up the same address twice in a week), add retry
   logic for IDI's flaky moments.

7. **Cloudflare Web Analytics on refundlocators.com.** Free
   complement to Vercel Analytics. Better top-of-funnel data.

### LONG-TERM (only if metrics justify)

8. **Stream for personalized HeyGen videos.** Only relevant when the
   video pipeline ships. Cleaner than self-hosting on R2 + ffmpeg if
   videos hit any volume.

---

## 5. What NOT to do with Cloudflare

- **Don't turn on the orange-cloud proxy** for refundlocators.com.
  Vercel is already a global CDN. Double-CDNing causes problems.
- **Don't use Cloudflare Workers AI as a Lauren replacement** — quality
  isn't there yet for your use case. The cost savings won't matter
  until you're at thousands of conversations/day.
- **Don't migrate refundlocators.com itself off Vercel to Cloudflare
  Pages.** Vercel's Next.js integration is meaningfully better for our
  app stack. The DCC is a different story (single-file HTML, no Next.js).
- **Don't use Cloudflare's "Always Use HTTPS"** in DNS-only mode — it
  doesn't apply, since we're not proxying.
- **Don't rely on Cloudflare's free SSL** — we get SSL through Vercel.
  Cloudflare's certificate would only matter if we proxied (we don't).

---

## 6. Verifying Nathan's account

The DCC agent should run these checks to map the actual state:

```bash
# Verify which domains are on Cloudflare DNS
for d in refundlocators.com fundlocators.com defenderfunds.com; do
  echo "=== $d ==="
  dig NS $d +short
done

# If Nathan provides API token, list all zones in the account
curl -H "Authorization: Bearer $CF_API_TOKEN" \
     https://api.cloudflare.com/client/v4/zones

# List active products on the account (requires account-scoped token)
curl -H "Authorization: Bearer $CF_API_TOKEN" \
     https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/subscriptions
```

---

## 7. Cost estimate — what Cloudflare will cost FundLocators

If we adopt all the TIER 1 + TIER 2 recommendations:

| Product | Monthly cost |
|---|---|
| DNS (current) | $0 |
| Pages (DCC hosting) | $0 |
| R2 (assets, ~5GB) | ~$0.10 |
| Workers (free tier covers it) | $0 |
| Turnstile | $0 |
| Email Routing | $0 |
| Web Analytics | $0 |
| **Total** | **~$0.10/month** |

If volume scales 100x: still under $20/month. Cloudflare's pricing
model rewards small operators heavily.

---

## 8. Open questions for Nathan to answer

The DCC agent should get answers from Nathan before doing anything
mutative:

1. **What's the Cloudflare account ID?** (URL bar of the dashboard)
2. **What domains are in the account?** (refundlocators, fundlocators,
   defender — what else?)
3. **Is there an existing API token, or should we create one?**
4. **Plan tier: Free, Pro ($25/mo), Business ($250/mo), Enterprise?**
   Most likely Free given the DNS-only setup.
5. **Has anyone touched Cloudflare beyond DNS setup?** (R2 buckets,
   Workers, Pages projects already created and forgotten?)
6. **What email should `nathan@refundlocators.com` forward to?**

---

## 9. Reference

- Cloudflare API docs: https://developers.cloudflare.com/api/
- R2 quickstart: https://developers.cloudflare.com/r2/get-started/
- Workers quickstart: https://developers.cloudflare.com/workers/get-started/guide/
- Pages quickstart: https://developers.cloudflare.com/pages/get-started/
- Turnstile docs: https://developers.cloudflare.com/turnstile/
- Email Routing setup: https://developers.cloudflare.com/email-routing/setup/

---

That's everything. The DCC agent should start with question 1 in
section 8 and work down before changing anything in the Cloudflare
account.
