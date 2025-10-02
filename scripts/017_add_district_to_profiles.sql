-- Add district column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS district text;

-- Update existing profiles to have empty district
UPDATE profiles SET district = '' WHERE district IS NULL;
