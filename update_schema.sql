-- Run this in your Supabase SQL Editor to support the new features

-- 1. Add theme_color to blogs
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS theme_color text DEFAULT 'rgba(6, 26, 48, 0.7)';

-- 2. Create site_settings table to store global profile photo
CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  profile_image_url text
);

-- Insert default row
INSERT INTO site_settings (id, profile_image_url) VALUES (1, '') ON CONFLICT (id) DO NOTHING;

-- Allow public read access to site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to site_settings"
  ON site_settings FOR SELECT
  USING (true);

-- Allow authenticated users to update settings
CREATE POLICY "Allow authenticated users to update settings"
  ON site_settings FOR UPDATE
  USING (auth.role() = 'authenticated');
  
CREATE POLICY "Allow authenticated users to insert settings"
  ON site_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
