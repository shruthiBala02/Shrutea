-- Relax rate_limits for Anon key usage in server actions
DROP POLICY IF EXISTS "No public access to rate_limits" ON rate_limits;
CREATE POLICY "Enable all for server actions" ON rate_limits FOR ALL USING (true) WITH CHECK (true);

-- Ensure comments user_id is optional
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;
