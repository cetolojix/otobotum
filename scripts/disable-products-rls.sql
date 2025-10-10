-- Disable RLS on products table to allow service role key access
-- This is necessary because the API uses service role key which bypasses user authentication

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage their own products" ON public.products;

-- Disable RLS
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Create a permissive policy for service role (optional, but good practice)
-- This allows all operations when using service role key
CREATE POLICY "Service role can manage all products"
  ON public.products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
