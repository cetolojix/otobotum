-- Disable ALL auth.users triggers to prevent signup failures
-- We'll handle profile and trial creation manually in the application code

-- Drop all triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created_trial ON auth.users;
DROP TRIGGER IF EXISTS create_trial_on_signup ON auth.users;
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;

-- Drop related functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_trial_period();
DROP FUNCTION IF EXISTS public.create_trial_for_new_user();
DROP FUNCTION IF EXISTS public.auto_confirm_email();

-- Add comments for future reference
COMMENT ON TABLE public.profiles IS 'Profiles are created manually after successful user signup';
COMMENT ON TABLE public.trial_periods IS 'Trial periods are created manually after successful user signup';
