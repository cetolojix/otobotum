-- Delete old packages that are no longer needed
-- Keep only: basic, plus, pro, custom

-- First, check if any users are using these old packages
-- If they are, we'll migrate them to the closest equivalent

-- Migrate users from 'starter' to 'basic'
UPDATE user_packages 
SET package_name = 'basic'
WHERE package_name = 'starter';

-- Migrate users from 'professional' to 'plus'
UPDATE user_packages 
SET package_name = 'plus'
WHERE package_name = 'professional';

-- Migrate users from 'enterprise' to 'pro'
UPDATE user_packages 
SET package_name = 'pro'
WHERE package_name = 'enterprise';

-- Now delete the old packages
DELETE FROM packages 
WHERE name IN ('starter', 'professional', 'enterprise');

-- Verify only 4 packages remain
SELECT name, display_name_tr, price_monthly 
FROM packages 
ORDER BY price_monthly;
