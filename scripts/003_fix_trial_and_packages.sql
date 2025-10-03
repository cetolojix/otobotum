-- Add missing columns to packages table for iyzico integration
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS iyzico_monthly_plan_reference_code TEXT,
ADD COLUMN IF NOT EXISTS iyzico_yearly_plan_reference_code TEXT;

-- Create function to automatically create trial for new users
CREATE OR REPLACE FUNCTION create_trial_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a 7-day trial period for the new user
  INSERT INTO trial_periods (user_id, started_at, ends_at, is_active)
  VALUES (
    NEW.id,
    NOW(),
    NOW() + INTERVAL '7 days',
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS create_trial_on_signup ON auth.users;

-- Create trigger on auth.users table to automatically create trial
CREATE TRIGGER create_trial_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_for_new_user();

-- Update existing packages with default iyzico codes (you'll need to replace these with real codes from iyzico)
-- For now, we'll set them to NULL so the system knows they need to be configured
UPDATE packages 
SET 
  iyzico_monthly_plan_reference_code = NULL,
  iyzico_yearly_plan_reference_code = NULL
WHERE iyzico_monthly_plan_reference_code IS NULL;

-- Insert default packages if the table is empty
INSERT INTO packages (
  name,
  display_name_tr,
  display_name_en,
  max_instances,
  max_whatsapp_instances,
  max_instagram_instances,
  max_messenger_instances,
  price_monthly,
  price_yearly,
  features,
  is_active
)
SELECT 
  'starter',
  'Başlangıç',
  'Starter',
  3,
  2,
  1,
  1,
  299,
  2990,
  '["2 WhatsApp instance", "1 Instagram instance", "1 Messenger instance", "Temel AI özellikleri", "Email destek"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'starter')

UNION ALL

SELECT 
  'professional',
  'Profesyonel',
  'Professional',
  10,
  6,
  3,
  3,
  599,
  5990,
  '["6 WhatsApp instance", "3 Instagram instance", "3 Messenger instance", "Gelişmiş AI özellikleri", "Öncelikli destek", "Özel entegrasyonlar"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'professional')

UNION ALL

SELECT 
  'enterprise',
  'Kurumsal',
  'Enterprise',
  50,
  30,
  15,
  15,
  1299,
  12990,
  '["30 WhatsApp instance", "15 Instagram instance", "15 Messenger instance", "Tüm AI özellikleri", "7/24 destek", "Özel entegrasyonlar", "Özel eğitim", "API erişimi"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'enterprise');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON packages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON trial_periods TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_subscriptions TO authenticated;

-- Create RLS policies for trial_periods if they don't exist
ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own trial periods" ON trial_periods;
CREATE POLICY "Users can view their own trial periods"
  ON trial_periods FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert trial periods" ON trial_periods;
CREATE POLICY "System can insert trial periods"
  ON trial_periods FOR INSERT
  WITH CHECK (true);

-- Create a function to manually create trial for existing users who don't have one
CREATE OR REPLACE FUNCTION create_missing_trials()
RETURNS void AS $$
BEGIN
  -- Create trials for users who don't have one
  INSERT INTO trial_periods (user_id, started_at, ends_at, is_active)
  SELECT 
    au.id,
    NOW(),
    NOW() + INTERVAL '7 days',
    true
  FROM auth.users au
  LEFT JOIN trial_periods tp ON tp.user_id = au.id
  WHERE tp.id IS NULL
  AND au.email NOT LIKE '%@test.com'; -- Exclude test users if needed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create trials for existing users
SELECT create_missing_trials();

COMMENT ON FUNCTION create_trial_for_new_user() IS 'Automatically creates a 7-day trial period for new users';
COMMENT ON FUNCTION create_missing_trials() IS 'Creates trial periods for existing users who do not have one';
