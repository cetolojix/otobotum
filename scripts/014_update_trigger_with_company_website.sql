-- Updated function to handle new user registration with full profile data including company_website
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    phone, 
    username, 
    city, 
    address, 
    company_name, 
    company_address, 
    company_tax_number, 
    company_website,
    account_type
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'user',  -- Default role is 'user'
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'city', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'address', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Kişisel Kullanım'),
    COALESCE(NEW.raw_user_meta_data ->> 'company_address', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'company_tax_number', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'company_website', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'account_type', 'personal')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
