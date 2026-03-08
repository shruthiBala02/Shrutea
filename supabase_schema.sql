-- Create blogs table
CREATE TABLE public.blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_published BOOLEAN DEFAULT FALSE
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subscribers table
CREATE TABLE public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Blogs Policies
-- Everyone can read published blogs
CREATE POLICY "Public can read published blogs" ON public.blogs
  FOR SELECT USING (is_published = true);

-- Only authenticated admins can create/update/delete blogs (you will need to use your specific user_id later, for now we allow authenticated writes just for the prototype, or we'll handle it via an admin email check in the frontend).
CREATE POLICY "Authenticated users can create blogs" ON public.blogs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users can update blogs" ON public.blogs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Comments Policies
-- Everyone can read comments
CREATE POLICY "Public can read comments" ON public.comments
  FOR SELECT USING (true);

-- Only authenticated users can insert their own comments
CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscribers Policies
-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe" ON public.subscribers
  FOR INSERT WITH CHECK (true);

-- Only authenticated (admin) can read subscribers
CREATE POLICY "Admin can read subscribers" ON public.subscribers
  FOR SELECT USING (auth.role() = 'authenticated');
