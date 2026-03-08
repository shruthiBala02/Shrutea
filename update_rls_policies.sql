-- This script updates the database RLS policies to work without Supabase Auth,
-- since we moved to a custom Secret Code login system for the Admin Studio.
-- Our Next.js backend server actions now handle the security authorization.

-- 1. Blogs Table Policies
DROP POLICY IF EXISTS "Authenticated users can create blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authenticated users can update blogs" ON public.blogs;

CREATE POLICY "Allow public insert to blogs" ON public.blogs
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow public update to blogs" ON public.blogs
  FOR UPDATE USING (true);

-- 2. Storage Bucket Policies
-- Ensure the images bucket is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing restricted storage policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;

-- Allow public reads and uploads to the images bucket
CREATE POLICY "Public reads on images bucket" 
ON storage.objects FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Public uploads to images bucket" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');

-- 3. Site Settings Policies
CREATE POLICY "Allow public update to site_settings" ON public.site_settings
  FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to site_settings" ON public.site_settings
  FOR INSERT WITH CHECK (true);
