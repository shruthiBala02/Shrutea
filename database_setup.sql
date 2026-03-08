-- Run this in your Supabase SQL Editor to finish setting up the storage, stats, and test posts

-- 1. Create the Storage Bucket for Images
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- 2. Setup Security Policies for Storage
create policy "Public Access" 
  on storage.objects for select 
  using ( bucket_id = 'images' );

create policy "Auth Insert" 
  on storage.objects for insert 
  with check ( bucket_id = 'images' and auth.role() = 'authenticated' );

-- 3. Ensure the tables exist (in case you deleted them)
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  is_published boolean DEFAULT false,
  theme_color text DEFAULT 'rgba(6, 26, 48, 0.7)',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  likes_count integer DEFAULT 0,
  views_count integer DEFAULT 0
);

create policy "Public blogs are viewable by everyone." on blogs for select using (true);
create policy "Users can insert their own blogs." on blogs for insert with check (auth.role() = 'authenticated');
create policy "Users can update own blogs." on blogs for update using (auth.role() = 'authenticated');

-- 4. Generate 3 Test Posts so you can see the layout immediately
INSERT INTO blogs (title, content, image_url, theme_color, is_published, likes_count, views_count)
VALUES 
(
  'The Art of Slow Living in a Fast World', 
  '<p>Sometimes, the most productive thing we can do is nothing at all. In an era where being busy is a badge of honor, taking a step back to appreciate a quiet morning coffee feels like a rebellion.</p>', 
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1473&auto=format&fit=crop', 
  'rgba(6, 48, 40, 0.7)', 
  true, 
  143, 
  2500
),
(
  'A Deep Dive into Sports Analytics', 
  '<p>Data is changing the way we play, watch, and understand sports. Today, I want to talk about how simple statistics can reveal the hidden narrative of a badminton match, turning intuition into measurable truth.</p>', 
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1470&auto=format&fit=crop', 
  'rgba(48, 6, 12, 0.7)', 
  true, 
  89, 
  1200
),
(
  'Lessons from Modern Family', 
  '<p>It is amazing how a simple sitcom can teach you more about empathy and acceptance than a self-help book. The chaotic love of the Pritchett-Dunphy clan is a reminder that family does not need to be perfect to be wonderful.</p>', 
  null, 
  'rgba(26, 6, 48, 0.7)', 
  true, 
  312, 
  5400
);
