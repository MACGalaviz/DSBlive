-- Migration: mark records as favorites.
-- Run once in the Supabase SQL Editor on an existing database.
--
-- is_favorite flags a record so it can be found quickly and re-used (e.g.
-- duplicated). Shared across all viewers; only the owner can toggle it (the
-- existing owner-write RLS on records already enforces this).
ALTER TABLE records ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_records_is_favorite ON records(is_favorite) WHERE is_favorite;
