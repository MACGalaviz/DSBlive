-- SQL Script to create tables in Supabase
-- Copy and paste this code in Supabase SQL Editor

-- Fields Table
CREATE TABLE IF NOT EXISTS fields (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('text', 'number', 'date', 'time', 'selector', 'boolean')),
    options JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Types Table
CREATE TABLE IF NOT EXISTS form_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    chart_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form-Field Relationship Table
CREATE TABLE IF NOT EXISTS form_fields (
    id BIGSERIAL PRIMARY KEY,
    form_type_id BIGINT NOT NULL REFERENCES form_types(id) ON DELETE CASCADE,
    field_id BIGINT NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(form_type_id, field_id)
);

-- Records Table
CREATE TABLE IF NOT EXISTS records (
    id BIGSERIAL PRIMARY KEY,
    form_type_id BIGINT NOT NULL REFERENCES form_types(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_form_fields_form_type ON form_fields(form_type_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_field ON form_fields(field_id);
CREATE INDEX IF NOT EXISTS idx_records_form_type ON records(form_type_id);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Access model: PUBLIC read, OWNER-only write (public demo pattern).
--   * SELECT  -> anyone can read (public demo)
--   * INSERT / UPDATE / DELETE -> only the owner account can write
--
-- SETUP: replace 'OWNER_USER_ID' below with YOUR Supabase Auth user UID.
--   Get it in: Authentication > Users > (your user) > User UID.
--   Then re-run this policy section.
-- NOTE: writes are gated at the DATABASE. Hiding buttons in the UI is not
--   security; this RLS is what actually blocks non-owner writes.
-- ALTERNATIVE (private instance, any logged-in user may write):
--   replace  auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid  with  auth.uid() IS NOT NULL

-- Make this script re-runnable and safe: drop ANY existing policy on these
-- tables first, so no stray/permissive policy can survive next to the ones below.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('fields', 'form_types', 'form_fields', 'records')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- fields
CREATE POLICY "Public read" ON fields
    FOR SELECT USING (true);
CREATE POLICY "Owner insert" ON fields
    FOR INSERT WITH CHECK (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);
CREATE POLICY "Owner update" ON fields
    FOR UPDATE USING (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);
CREATE POLICY "Owner delete" ON fields
    FOR DELETE USING (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);

-- form_types
CREATE POLICY "Public read" ON form_types
    FOR SELECT USING (true);
CREATE POLICY "Owner insert" ON form_types
    FOR INSERT WITH CHECK (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);
CREATE POLICY "Owner update" ON form_types
    FOR UPDATE USING (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);
CREATE POLICY "Owner delete" ON form_types
    FOR DELETE USING (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);

-- form_fields
CREATE POLICY "Public read" ON form_fields
    FOR SELECT USING (true);
CREATE POLICY "Owner insert" ON form_fields
    FOR INSERT WITH CHECK (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);
CREATE POLICY "Owner update" ON form_fields
    FOR UPDATE USING (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);
CREATE POLICY "Owner delete" ON form_fields
    FOR DELETE USING (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);

-- records
CREATE POLICY "Public read" ON records
    FOR SELECT USING (true);
CREATE POLICY "Owner insert" ON records
    FOR INSERT WITH CHECK (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);
CREATE POLICY "Owner update" ON records
    FOR UPDATE USING (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);
CREATE POLICY "Owner delete" ON records
    FOR DELETE USING (auth.uid() = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'::uuid);
