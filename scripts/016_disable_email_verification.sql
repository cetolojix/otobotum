-- Disable email verification requirement
-- This allows users to sign in immediately after registration without confirming their email

-- Note: This is a configuration change that needs to be applied in Supabase Dashboard
-- Go to Authentication > Settings > Email Auth and disable "Enable email confirmations"

-- For now, we'll update our registration flow to handle unconfirmed emails
-- and allow users to sign in immediately

-- Create a function to handle user registration without email confirmation
CREATE OR REPLACE FUNCTION handle_registration_without_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Set email_confirmed_at to current timestamp to bypass email verification
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically confirm emails on user creation
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_registration_without_email_confirmation();

-- Also handle the duplicate phone issue by updating the unique constraint
-- to allow NULL values (in case phone is not provided)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS unique_phone;
ALTER TABLE profiles ADD CONSTRAINT unique_phone_not_null 
  UNIQUE (phone) DEFERRABLE INITIALLY DEFERRED;

-- Add a function to handle duplicate phone numbers gracefully
CREATE OR REPLACE FUNCTION handle_duplicate_phone_registration(
  user_id UUID,
  user_email TEXT,
  user_phone TEXT,
  user_full_name TEXT,
  user_username TEXT,
  user_city TEXT,
  user_address TEXT,
  user_company_name TEXT,
  user_company_address TEXT,
  user_company_tax_number TEXT,
  user_company_website TEXT,
  user_account_type TEXT,
  user_role TEXT
)
RETURNS JSON AS $$
DECLARE
  existing_profile_id UUID;
  result JSON;
BEGIN
  -- Check if a profile with this phone already exists
  SELECT id INTO existing_profile_id 
  FROM profiles 
  WHERE phone = user_phone;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Update existing profile instead of creating new one
    UPDATE profiles SET
      email = user_email,
      full_name = user_full_name,
      username = user_username,
      city = user_city,
      address = user_address,
      company_name = user_company_name,
      company_address = user_company_address,
      company_tax_number = user_company_tax_number,
      company_website = user_company_website,
      account_type = user_account_type,
      role = user_role,
      updated_at = NOW()
    WHERE id = existing_profile_id;
    
    result := json_build_object(
      'success', true,
      'action', 'updated',
      'profile_id', existing_profile_id,
      'message', 'Existing profile updated with new information'
    );
  ELSE
    -- Create new profile
    INSERT INTO profiles (
      id, email, full_name, phone, username, city, address,
      company_name, company_address, company_tax_number, company_website,
      account_type, role, created_at, updated_at
    ) VALUES (
      user_id, user_email, user_full_name, user_phone, user_username, 
      user_city, user_address, user_company_name, user_company_address,
      user_company_tax_number, user_company_website, user_account_type, 
      user_role, NOW(), NOW()
    );
    
    result := json_build_object(
      'success', true,
      'action', 'created',
      'profile_id', user_id,
      'message', 'New profile created successfully'
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
