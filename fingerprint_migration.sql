-- Add fingerprint column to post_likes
ALTER TABLE post_likes ADD COLUMN IF NOT EXISTS fingerprint TEXT;

-- Update the unique constraint on post_likes: 
-- One like per (blog_id, email) OR (blog_id, fingerprint) if we want to be strict.
-- Since the user wants to remove email for likes, we'll shift the unique constraint to (blog_id, fingerprint).
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_blog_id_email_key;
ALTER TABLE post_likes ADD CONSTRAINT post_likes_blog_id_fingerprint_key UNIQUE (blog_id, fingerprint);

-- Update rate_limits to reflect fingerprint-based tracking
-- We'll rename ip_address to identifier or just keep using it to store the fingerprint hash.
-- Renaming is cleaner for the long term.
ALTER TABLE rate_limits RENAME COLUMN ip_address TO identifier;
ALTER TABLE rate_limits DROP CONSTRAINT IF EXISTS rate_limits_ip_address_action_type_key;
ALTER TABLE rate_limits ADD CONSTRAINT rate_limits_identifier_action_type_key UNIQUE (identifier, action_type);
