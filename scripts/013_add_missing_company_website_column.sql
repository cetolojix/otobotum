-- Add missing company_website column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_website TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.company_website IS 'Company website URL';
