# Lauren — Complete Technical Handoff for the DCC

Everything the DCC agent needs to build internal Lauren features. This doc
is the source of truth for: how Lauren chat works, how conversations are
captured, what the data model looks like, and what endpoints already exist.

The DCC and refundlocators.com **share the same Supabase instance**, so
any DCC tab can read directly from `lauren_conversations` and write
through `service_role` exactly like the website does.

---

## 1. What Lauren is

A consumer-facing AI chat agent on refundlocators.com that answers
questions about Ohio foreclosure surplus funds. She runs in two contexts:

- **Generic mode** (homepage and county pages, no token): trained on
  Ohio surplus law, gives plain-English answers, suggests next steps.
- **Token mode** (on `/s/[token]`): receives the visitor's specific case
  data (property, county, surplus estimate, sale date, etc.) so she can
  answer "what's MY case about?" with real numbers.

Lauren is a competitive moat — zero competitors in surplus recovery have
a consumer-facing AI per our research. She's also a research surface:
every conversation is logged, so we can read what people ask, where they
bail, and what objections come up.

---

## 2. Backing service — the Lauren chat brain

Lauren's actual responses come from a Supabase Edge Function:

- **Production URL**: `https://rcfaashkfpurkvtmsmeb.supabase.co/functions/v1/lauren-chat`
- **Method**: `POST`
- **Auth**: none required (publicly accessible — function does its own
  prompt construction; no service-role key used)

### Request body

```json
{
  "messages": [
    { "role": "assistant", "content": "Hi, I'm Lauren..." },
    { "role": "user",      "content": "what's a surplus" }
  ],
  "session_id": "uuid-or-null",
  "visitor_id": "uuid-from-localStorage",
  "personalization_context": "Person: Sharon Hayes\nProperty: 2624 Maple Ave..."
}
```

- `messages` — full transcript so far, oldest first. Server uses this
  for context when generating the next reply.
- `session_id` — null on first call; the function returns one in its
  response. Pass it on subsequent calls so Lauren stitches sessions.
- `visitor_id` — a stable per-browser UUID stored in `localStorage`
  under key `lauren_visitor_id`. Lets us correlate conversations across
  page reloads and across the website ↔ DCC boundary.
- `personalization_context` — optional plain-text block that gets
  injected as a system-prompt addendum. Used on `/s/[token]` to give
  Lauren the recipient's case data. Format is freeform multi-line text.

### Response body

```json
{
  "reply": "A surplus is the leftover money from a sheriff's sale...",
  "session_id": "uuid",
  "deal_id": null
}
```

If `data.reply` is empty or missing, the website shows a graceful
fallback: *"Sorry — I had trouble with that. You can text our team at
(513) 516-2306 and we'll get right back to you."*

### Practical notes for the DCC

- **You can call this endpoint directly from the DCC** to give Nathan
  an internal "Ask Lauren about this case" feature inside any deal view.
  Just compose the messages array and POST.
- **Pass a `personalization_context`** with the deal's data when calling
  from inside the DCC, so Lauren acts like the on-page agent does.
- **Use a separate `visitor_id` for internal use** (e.g. prefix with
  `internal-` or use Nathan's user UUID) so internal queries don't
  pollute the public-facing analytics.

---

## 3. Data model — `lauren_conversations` table

Every consumer-facing conversation is captured here. Schema:

```sql
CREATE TABLE lauren_conversations (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id      text        NOT NULL,                                -- stable per-browser UUID
  started_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  page_origin     text,                                                 -- '/' or '/s/{token}' or '/ohio/{slug}'
  token           text,                                                 -- the personalized link token, if from /s/[token]
  seed_message    text,                                                 -- first auto-sent message (e.g. from search handoff)
  transcript      jsonb       NOT NULL DEFAULT '[]'::jsonb,             -- full ChatMsg[]
  message_count   int         NOT NULL DEFAULT 0,
  submitted_claim boolean     NOT NULL DEFAULT false,                   -- flipped when /api/s/claim matches visitor_id
  user_agent      text,
  ip              text
);

CREATE INDEX lauren_conversations_visitor_idx
  ON lauren_conversations (visitor_id, started_at DESC);
CREATE INDEX lauren_conversations_started_idx
  ON lauren_conversations (started_at DESC);
```

### Transcript format

`transcript` is a JSONB array of `{ role, content }` objects, oldest first:

```json
[
  { "role": "assistant", "content": "Hi, I'm Lauren — RefundLocators' AI..." },
  { "role": "user",      "content": "is this a scam?" },
  { "role": "assistant", "content": "Fair question. We're a real..." }
]
```

`role` is always one of `'assistant'` or `'user'`. No system messages
in the transcript — those live in the backend prompt.

### Conversion stamping

When a visitor submits the claim form on `/s/[token]`, the website's
`/api/s/claim` endpoint executes:

```sql
UPDATE lauren_conversations
   SET submitted_claim = true
 WHERE visitor_id = $visitor_id
   AND started_at >= now() - interval '24 hours';
```

So any chat from the same browser within the last 24h gets flagged as
having converted. The DCC can rely on this field as ground truth for
"this conversation led to a claim."

### Sample analytics queries

```sql
-- Conversion rate by page origin (last 30 days)
SELECT
  COALESCE(page_origin, '(unknown)') AS page,
  COUNT(*)                            AS conversations,
  SUM(CASE WHEN submitted_claim THEN 1 ELSE 0 END) AS claims,
  ROUND(100.0 * SUM(CASE WHEN submitted_claim THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) AS pct
FROM lauren_conversations
WHERE started_at > now() - interval '30 days'
GROUP BY 1
ORDER BY conversations DESC;

-- Top first-questions (what people open with)
SELECT
  LOWER(transcript->0->>'content') AS opening,
  COUNT(*)                          AS n
FROM lauren_conversations
WHERE jsonb_array_length(transcript) > 0
  AND started_at > now() - interval '30 days'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 25;

-- Conversations that are flagging "scam" / "legit" / "trust" worries
SELECT id, started_at, message_count, transcript
FROM lauren_conversations
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements(transcript) AS m
  WHERE m->>'role' = 'user'
    AND (
      m->>'content' ILIKE '%scam%' OR
      m->>'content' ILIKE '%legit%' OR
      m->>'content' ILIKE '%trust%' OR
      m->>'content' ILIKE '%real%' OR
      m->>'content' ILIKE '%catch%'
    )
)
ORDER BY started_at DESC;

-- Visitors who chatted with Lauren AND submitted a claim, with the time delta
SELECT
  visitor_id,
  MIN(started_at)         AS first_chat,
  MAX(last_message_at)    AS last_chat,
  bool_or(submitted_claim) AS converted
FROM lauren_conversations
GROUP BY visitor_id
HAVING bool_or(submitted_claim)
ORDER BY MAX(last_message_at) DESC;

-- Average messages-per-conversation by outcome
SELECT
  submitted_claim,
  COUNT(*) AS n,
  ROUND(AVG(message_count), 1) AS avg_msgs
FROM lauren_conversations
WHERE message_count > 0
GROUP BY 1;
```

---

## 4. API endpoints (all on refundlocators.com)

### `POST /api/lauren/log` — capture endpoint (public)

The website's chat sheet calls this debounced 1.5s after every message
change, plus once more via `sendBeacon` on close.

**Request:**

```json
{
  "conversation_id": "uuid-or-null",
  "visitor_id": "stable-uuid",
  "page_origin": "/s/abc123",
  "token": "abc123",
  "seed_message": "I just searched 2624 Maple Ave...",
  "transcript": [
    { "role": "assistant", "content": "..." },
    { "role": "user",      "content": "..." }
  ]
}
```

**Behavior:**
- If `conversation_id` is null → INSERT a new row, returns the new ID.
- If `conversation_id` is set → UPDATE that row's transcript +
  message_count + last_message_at.
- Safe-fail: if the table doesn't exist (or the insert errors), returns
  `{ id: null, deferred: true }` so the chat keeps working.

**Response:**

```json
{ "id": "uuid" }
```

### `GET /api/admin/lauren/list` — paginated list (admin auth required)

**Query params:**
- `limit` (default 50, max 200)
- `offset` (default 0)
- `converted` (set to `1` to filter for `submitted_claim = true`)

**Response:**

```json
{
  "rows": [
    {
      "id": "uuid",
      "visitor_id": "...",
      "started_at": "ISO",
      "last_message_at": "ISO",
      "page_origin": "/s/abc123",
      "token": "abc123",
      "seed_message": "...",
      "message_count": 7,
      "submitted_claim": false,
      "first_question": "is this a scam?"   // first user msg, truncated to 140 chars
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

### `GET /api/admin/lauren/[id]` — full transcript (admin auth required)

Returns the entire `lauren_conversations` row including the full
transcript array.

### Auth on `/api/admin/*` and `/admin/*`

The website uses an `admin_token` cookie checked by `src/proxy.ts`
(Next 16's renamed middleware). The DCC has its own auth — when reading
from the DCC, just go straight to Supabase via service_role.

---

## 5. Frontend chat component — `LaurenSheet.tsx`

Source: `src/components/LaurenSheet.tsx` in the website repo.

Key features the DCC may want to mirror or reuse:

### Props

```ts
interface LaurenSheetProps {
  open: boolean;
  onClose: () => void;
  token?: LaurenTokenContext;  // when present, Lauren acts case-aware
  seed?: string;               // optional first user message, auto-sent on open
}

interface LaurenTokenContext {
  firstName?: string;
  lastName?: string;
  propertyAddress: string;
  county: string;
  caseNumber: string;
  saleDate: string;
  salePrice: number;
  judgmentAmount: number;
  estimatedLow: number;
  estimatedHigh: number;
  confirmed: boolean;
  confirmedAmount?: number | null;
}
```

### Critical behaviors (gotchas already solved)

These bugs all bit the website during development. If the DCC
re-implements the chat, watch for them:

1. **Stale-closure bug in send loop.** Don't read `messages` from the
   closure inside `send()`. Mirror messages into a `useRef` and read
   from the ref. `setMessages(prev => ...)` updaters run during commit
   phase, AFTER the synchronous fetch is initiated — so if you build
   the request body from a `setMessages` updater snapshot, the body
   ships with `messages: []`.
2. **Concurrency lock should be a ref, not state.** `useState` for
   `thinking` + `if (thinking) return` at top of send doesn't work —
   state writes don't propagate across the same render's closures.
   Use `useRef(false)` for an in-flight lock and check `inFlightRef.current`.
3. **Always wrap the fetch in `AbortController` with a 25s timeout.**
   A hung request will permanently wedge the send button if you don't.
4. **Don't disable the input while Lauren is typing.** Let the user
   compose the next message in parallel — only the send button gates
   the actual submit. Disabling the input feels broken on mobile.
5. **Use `font-size: 16px` minimum on the input.** iOS Safari
   auto-zooms inputs under 16px. That zoom + the keyboard appearing =
   the worst chat UX you've ever experienced.
6. **iOS keyboard handling needs `visualViewport`.** When the keyboard
   appears, `100vh` doesn't shrink. Listen to `window.visualViewport`
   and set the sheet's `height` inline to `vv.height` so the input
   stays above the keyboard. Lock body scroll while sheet is open.
7. **`sendBeacon` for the final log flush on close** so it survives
   page navigation.
8. **Reset all refs (`inFlightRef`, `sessionRef`, `conversationIdRef`,
   `messagesRef`) when the sheet closes** so a re-open starts clean.

### Logging integration

```ts
// Inside the chat component, debounced log writes:
useEffect(() => {
  if (!open) return;
  const hasUserContent = messages.some(m => m.role === 'user');
  if (!hasUserContent) return;
  if (logTimerRef.current) clearTimeout(logTimerRef.current);
  logTimerRef.current = setTimeout(() => {
    fetch('/api/lauren/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        conversation_id: conversationIdRef.current,
        visitor_id: getVisitorId(),
        page_origin: window.location.pathname,
        token: token ? token.propertyAddress : null,
        seed_message: seed || null,
        transcript: messagesRef.current,
      }),
    })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data && data.id && !conversationIdRef.current) {
        conversationIdRef.current = data.id;
      }
    })
    .catch(() => {});
  }, 1500);
}, [messages, thinking, open, seed, token]);
```

The DCC's internal "Ask Lauren" tool can either:

- **Skip logging entirely** if internal use shouldn't pollute analytics, OR
- **Log with a distinguishable visitor_id prefix** (e.g.
  `internal-nathan-{user-uuid}`) so internal queries are filterable but
  searchable.

---

## 6. Admin viewer — `/admin/lauren`

Source: `src/app/admin/lauren/LaurenAdmin.tsx` in the website repo.

### What it does

Split-pane viewer:
- **Left pane**: paginated list of conversations (50 per page), newest
  first, filter checkbox for "Converted only" (rows where
  `submitted_claim = true`).
- **Right pane**: tap any row to see the full transcript with meta
  (started, last_message_at, page_origin, token, seed_message,
  visitor_id, outcome).
- iMessage-style bubbles: gold = user, cream = Lauren.

### List item content

Each row shows:
- Relative timestamp (`3m ago`, `2d ago`)
- First user message preview (truncated to 140 chars)
- `{message_count} msgs · {page_origin}` + `· seeded` if seed_message exists
- Green `✓ claim` badge if `submitted_claim = true`

### What the DCC could improve over this

The website's `/admin/lauren` is intentionally functional, not pretty.
A DCC-native version could add:

- **Search** — full-text across transcript content (use Postgres `to_tsvector`).
- **Date range filter** — more flexible than just "last N pages."
- **Topic clustering** — group conversations by what the user opened with
  ("scam concerns", "process questions", "fee questions").
- **Sentiment / abandonment heuristic** — flag conversations where the
  user sent <3 messages before leaving (low engagement) vs. >5
  (high engagement, no claim → why?).
- **Inline actions** — buttons to "create deal" or "send Nathan a text"
  from a transcript that looks like it should convert.
- **Trainer hand-off** — if Lauren's answer was bad, button to "use this
  exchange as Lauren training data" → writes to `lauren_knowledge` table.
- **Keyword alerts** — flag conversations containing `"lawyer"`, `"sue"`,
  `"AG"`, `"complaint"`, `"refund"`, `"cancel"` so Nathan reads them
  immediately.

---

## 7. Lauren training surface — `lauren_knowledge` table

The website also has `/admin/train` (LaurenAdmin's sibling, source at
`src/app/admin/train/`) for adding to Lauren's knowledge base. Schema:

```sql
-- Already exists in Supabase
CREATE TABLE lauren_knowledge (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic       text,
  brand       text DEFAULT 'refundlocators',
  source_type text DEFAULT 'manual',     -- 'manual' | 'imported' | 'distilled'
  title       text,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);
```

The lauren-chat Edge Function reads from this table when constructing
its prompt, so any row added here changes Lauren's behavior immediately.
The DCC can write directly via service_role.

Endpoint pattern (already on the website at `/api/admin/knowledge`):

- `GET    /api/admin/knowledge`           — list all entries
- `POST   /api/admin/knowledge`           — create a new entry
- `DELETE /api/admin/knowledge/{id}`      — delete one (if exists)

---

## 8. Env vars and URLs

```
# Public — fine to ship in client bundle
NEXT_PUBLIC_LAUREN_URL = https://rcfaashkfpurkvtmsmeb.supabase.co/functions/v1/lauren-chat

# Server-side only — required for /api/lauren/log + admin endpoints
NEXT_PUBLIC_SUPABASE_URL    = https://rcfaashkfpurkvtmsmeb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = (copy from refundlocators-next/.env.local)
SUPABASE_SERVICE_ROLE_KEY   = (copy from refundlocators-next/.env.local)
```

The DCC already has these for its own purposes — verify it can read
`lauren_conversations` and write `lauren_knowledge` and you're done.

---

## 9. Recommended DCC Lauren features (priority order)

Based on what's most useful given the current pipeline:

1. **Deal-attached conversation reader.** When Nathan opens a deal in
   the DCC, show all Lauren conversations from that deal's visitor_id
   inline in a "Lauren history" section. Single most actionable use.
2. **Keyword/concern alerts in the DCC inbox.** Polls
   `lauren_conversations` for new rows containing alarm words ("scam,"
   "lawyer," "sue," "AG," "cancel") and surfaces them in the DCC's
   notification area so Nathan reads them within minutes.
3. **"Ask Lauren about this deal" button.** From any deal page, open a
   chat sheet that uses the deal's data as personalization_context and
   logs with `visitor_id = "internal-nathan-{user-uuid}"`. Lets Nathan
   use Lauren as a research tool.
4. **Lauren training queue.** Workflow: read a conversation → flag a
   bad exchange → write the correction → save to `lauren_knowledge`.
   Closes the loop on improving Lauren over time.
5. **Conversion analytics.** A simple chart: conversations per day,
   conversion rate by page origin, conversion rate by seed type
   (organic vs. seeded from search handoff). Validates whether Lauren
   is moving the needle.
6. **Daily digest.** Email Nathan once a day with: total conversations,
   converted ones, top 3 questions asked, any keyword-flagged
   conversations. Means he doesn't have to remember to check.

---

## 10. Reference implementation files in the website repo

If the DCC agent wants to read the actual source:

```
src/components/LaurenSheet.tsx                       — chat component (294 lines)
src/app/api/lauren/log/route.ts                      — capture endpoint (~100 lines)
src/app/api/admin/lauren/list/route.ts               — paginated list (~60 lines)
src/app/api/admin/lauren/[id]/route.ts               — single conversation (~30 lines)
src/app/admin/lauren/LaurenAdmin.tsx                 — viewer UI (~300 lines)
src/app/admin/lauren/page.tsx                        — viewer route stub (~10 lines)
src/app/s/[token]/lauren-ai.css                      — chat sheet styles (~250 lines)
src/proxy.ts                                          — admin auth gate
src/lib/supabase.ts                                  — getServiceClient() helper
src/lib/config.ts                                    — CONFIG.LAUREN_URL with fallback
supabase/migrations/20260426_claim_form_and_lauren_log.sql
                                                     — schema migration (already applied)
```

Repo: `https://github.com/TheLocatorOfFunds/refundlocators-next`
Branch: `main`

---

That's everything. Ping the website session if anything is unclear.
