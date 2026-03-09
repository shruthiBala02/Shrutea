-- MASTER SECURITY SETUP FOR SHRUTEA BLOG
-- This script is idempotent: you can run it multiple times safely.

-- 1. Setup Rate Limiting Table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL, -- Hashed fingerprint (was ip_address)
    action_type TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    last_request TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier, action_type)
);

-- Handle renaming ip_address to identifier if user is upgrading from old schema
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_limits' AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE rate_limits RENAME COLUMN ip_address TO identifier;
        ALTER TABLE rate_limits DROP CONSTRAINT IF EXISTS rate_limits_ip_address_action_type_key;
        ALTER TABLE rate_limits ADD CONSTRAINT rate_limits_identifier_action_type_key UNIQUE (identifier, action_type);
    END IF;
END $$;

-- 2. Setup Post Likes Tracking
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
    email TEXT, -- Optional now
    fingerprint TEXT, -- Unique device signature
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure fingerprint column exists
ALTER TABLE post_likes ADD COLUMN IF NOT EXISTS fingerprint TEXT;

-- Enforce One Like per Device/Post
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_blog_id_email_key;
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_blog_id_fingerprint_key;
ALTER TABLE post_likes ADD CONSTRAINT post_likes_blog_id_fingerprint_key UNIQUE (blog_id, fingerprint);

-- 3. Enhance Comments Table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_email TEXT;
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Rate Limits: Server-side only (relaxed for Anon key server actions)
DROP POLICY IF EXISTS "No public access to rate_limits" ON rate_limits;
DROP POLICY IF EXISTS "Enable all for server actions" ON rate_limits;
CREATE POLICY "Enable all for server actions" ON rate_limits FOR ALL USING (true) WITH CHECK (true);

-- Blogs: Public Read
DROP POLICY IF EXISTS "Public Read Access" ON blogs;
CREATE POLICY "Public Read Access" ON blogs FOR SELECT USING (is_published = true);

-- Likes: Public Insert once (logic handled by unique constraint)
DROP POLICY IF EXISTS "Public can like once" ON post_likes;
DROP POLICY IF EXISTS "Public can view likes" ON post_likes;
CREATE POLICY "Public can like once" ON post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view likes" ON post_likes FOR SELECT USING (true);

-- Comments: Public Insert/View
DROP POLICY IF EXISTS "Public can insert comments" ON comments;
DROP POLICY IF EXISTS "Public can view comments" ON comments;
CREATE POLICY "Public can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view comments" ON comments FOR SELECT USING (true);

-- Subscribers: Public Insert
DROP POLICY IF EXISTS "Public can subscribe" ON subscribers;
DROP POLICY IF EXISTS "No public read/update on subscribers" ON subscribers;
CREATE POLICY "Public can subscribe" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "No public read/update on subscribers" ON subscribers FOR SELECT USING (false);
