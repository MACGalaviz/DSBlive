-- Migration: per-form chart configuration.
-- Run once in the Supabase SQL Editor on an existing database.
--
-- chart_config holds the list of enabled dashboard chart keys for a form,
-- e.g. ["summaries", "distribution", "activity"]. NULL means "show all
-- applicable charts" (backward compatible with existing rows).
ALTER TABLE form_types ADD COLUMN IF NOT EXISTS chart_config JSONB;
