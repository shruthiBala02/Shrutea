-- Create guest_messages table
CREATE TABLE IF NOT EXISTS guest_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fingerprint TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (rate limited by fingerprint in server action)
CREATE POLICY "Allow public to insert messages" ON guest_messages
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admin) to view messages
CREATE POLICY "Allow admin to view messages" ON guest_messages
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users (admin) to delete messages
CREATE POLICY "Allow admin to delete messages" ON guest_messages
    FOR DELETE TO authenticated USING (true);
