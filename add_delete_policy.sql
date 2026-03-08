-- Add this to your Supabase SQL Editor to allow deleting blogs
-- since we disabled the default Auth we need an explicit DELETE policy 
-- (Our server checks the admin secret code before running this query!)

DROP POLICY IF EXISTS "Allow public delete to blogs" ON public.blogs;

CREATE POLICY "Allow public delete to blogs" ON public.blogs
  FOR DELETE USING (true);
