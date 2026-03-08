-- Create post_likes table to track unique likes per email
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blog_id, email)
);

-- Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Allow public to insert their likes, and read (for checking)
CREATE POLICY "Public can like once" ON post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view likes" ON post_likes FOR SELECT USING (true);

-- Ensure comments has an email field if not present (it usually uses author_name parsed from email, but let's be explicit if needed)
-- Our current schema uses author_name. We'll stick to that or check if we need a raw email field for checking limits.
-- Current addComment uses email to parse authorName. Let's add email column to comments for better tracking.
ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_email TEXT;

-- Policy for comments: check limit of 5 per email per post
-- This is easier to handle in the server action, but RLS could also do it with a function.
-- We'll handle the logic in the server action for better UX/error messages.
