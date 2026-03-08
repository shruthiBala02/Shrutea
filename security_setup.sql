-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    action_type TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    last_request TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ip_address, action_type)
);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Policies for rate_limits
-- Public can only see their own (but we don't actually need them to read it)
-- We'll use service role or just let the server action handle it since it uses a server-side client.
-- For safety, we allow no public access, only server-side.
CREATE POLICY "No public access to rate_limits" ON rate_limits
    FOR ALL USING (false);

-- Audit/Lock down existing tables
-- Blogs: Public can only READ
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON blogs FOR SELECT USING (is_published = true);

-- Comments: Public can INSERT, but not update or delete
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert comments" ON comments;
CREATE POLICY "Public can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view comments" ON comments FOR SELECT USING (true);

-- Subscribers: Public can INSERT only
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can subscribe" ON subscribers;
CREATE POLICY "Public can subscribe" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "No public read/update on subscribers" ON subscribers FOR SELECT USING (false);
