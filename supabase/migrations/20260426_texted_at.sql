-- One-column migration to track which leads have been texted.
-- Used by /admin/leads to filter the "Ready to text" queue.

ALTER TABLE personalized_links
  ADD COLUMN IF NOT EXISTS texted_at timestamptz;

CREATE INDEX IF NOT EXISTS personalized_links_texted_idx
  ON personalized_links (texted_at NULLS FIRST, created_at DESC);
