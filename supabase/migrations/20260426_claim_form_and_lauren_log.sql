-- Migration: 2026-04-26
-- Two changes:
--   (1) personalized_links: add columns the new claim modal writes to.
--       Without these, /api/s/claim returns 500 silently and every claim
--       form submission goes nowhere.
--   (2) lauren_conversations: persist every Lauren chat so we can read
--       transcripts, see where homeowners bail, and learn objections.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Claim-form columns on personalized_links
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE personalized_links
  ADD COLUMN IF NOT EXISTS mailing_address    text,
  ADD COLUMN IF NOT EXISTS claim_submitted_at timestamptz;

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Lauren conversation logging
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lauren_conversations (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id      text        NOT NULL,
  started_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  page_origin     text,                             -- '/' or '/s/{token}'
  token           text,                             -- when chat was opened from /s/[token]
  seed_message    text,                             -- if Lauren auto-started from a search result
  transcript      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  message_count   int         NOT NULL DEFAULT 0,
  submitted_claim boolean     NOT NULL DEFAULT false,
  user_agent      text,
  ip              text
);

-- Look-ups by visitor + recency (for the conversion stamp on /api/s/claim)
CREATE INDEX IF NOT EXISTS lauren_conversations_visitor_idx
  ON lauren_conversations (visitor_id, started_at DESC);

-- DCC list view (newest first)
CREATE INDEX IF NOT EXISTS lauren_conversations_started_idx
  ON lauren_conversations (started_at DESC);

ALTER TABLE lauren_conversations ENABLE ROW LEVEL SECURITY;

-- Service role (used by /api/lauren/log and DCC server-side queries) gets full access
DROP POLICY IF EXISTS "lauren_conversations_service_all" ON lauren_conversations;
CREATE POLICY "lauren_conversations_service_all"
  ON lauren_conversations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Optional admin SELECT policy — only adds it if a public.is_admin() function
-- exists in your schema (matches the pattern used by other admin-only tables).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'is_admin' AND n.nspname = 'public'
  ) THEN
    EXECUTE $POL$
      DROP POLICY IF EXISTS "lauren_conversations_admin_select" ON lauren_conversations;
      CREATE POLICY "lauren_conversations_admin_select"
        ON lauren_conversations FOR SELECT
        USING (public.is_admin());
    $POL$;
  END IF;
END $$;
