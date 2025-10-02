-- Disable the problematic trigger that's causing signup failures
-- We'll handle profile creation manually after successful signup

-- Drop the trigger that's causing the 500 error during signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function as well to clean up
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Add a comment for future reference
COMMENT ON TABLE public.profiles IS 'Profiles are now created manually after successful user signup to avoid trigger-related signup failures';
