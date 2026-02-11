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

-- Public access policies (adjust according to your needs)
-- IMPORTANT: These policies allow public access. 
-- For production, consider adding authentication and more restrictive policies.

CREATE POLICY "Enable read access for all users" ON fields
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON fields
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON fields
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON fields
    FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON form_types
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON form_types
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON form_types
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON form_types
    FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON form_fields
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON form_fields
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON form_fields
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON form_fields
    FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON records
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON records
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON records
    FOR DELETE USING (true);
