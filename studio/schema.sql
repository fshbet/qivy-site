-- Qivy Studio — the D1 schema, as it stands in the live database
-- (qivy-studio, b6a92c24-9238-4fd1-b778-9e3cbbc02aac).
--
-- This file exists because the schema previously lived nowhere but inside
-- that one database. If it were lost, nothing in this repository said how to
-- rebuild it. Dumped from sqlite_master on 2026-11-08.
--
-- To recreate the database from scratch:
--   wrangler d1 execute qivy-studio --remote --file studio/schema.sql
--
-- Changing the schema: add the ALTER at the bottom under a dated heading AND
-- apply it to the live database. Both, or the two drift apart again.

CREATE TABLE IF NOT EXISTS topics (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  topic      TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'ai',
  -- idea -> drafted -> published, or back to idea when a draft is rejected
  -- (a bad draft is usually a bad generation, not a bad topic).
  status     TEXT NOT NULL DEFAULT 'idea',
  title      TEXT,
  slug       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS drafts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id         INTEGER,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL,
  category         TEXT NOT NULL,
  summary          TEXT,
  seo_title        TEXT,
  meta_description TEXT,
  tags             TEXT,          -- comma separated
  sources          TEXT,          -- newline separated
  body             TEXT NOT NULL,
  warnings         TEXT,          -- newline separated, shown to the reviewer
  model            TEXT,          -- which model actually answered
  status           TEXT NOT NULL DEFAULT 'pending',
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at       TEXT,
  commit_url       TEXT,
  -- The validator's own count, not derived in SQL. Separator arithmetic
  -- counts a blank line twice, and the reviewer judges length against the
  -- 150-900 rule, so this has to be the number the rule was applied to.
  words            INTEGER
);

CREATE TABLE IF NOT EXISTS runs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ok         INTEGER NOT NULL,
  message    TEXT,
  draft_id   INTEGER
);

CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
-- Stops the same topic being queued twice by hand.
CREATE UNIQUE INDEX IF NOT EXISTS idx_topics_topic ON topics(topic);

-- ── Changes ───────────────────────────────────────────────────────────────
-- 2026-11-08  drafts.words added, and backfilled for draft 1:
--             ALTER TABLE drafts ADD COLUMN words INTEGER;
--             Already applied to the live database.
