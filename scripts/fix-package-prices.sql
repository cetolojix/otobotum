-- Fix package prices - convert TL to kuruş (cents)
-- 1 TL = 100 kuruş

-- Update Basic package - 1999 TL = 199900 kuruş
UPDATE packages
SET 
  price_monthly = 199900,
  price_yearly = 1999000,
  updated_at = now()
WHERE name = 'basic';

-- Update Plus package - 2999 TL = 299900 kuruş
UPDATE packages
SET 
  price_monthly = 299900,
  price_yearly = 2999000,
  updated_at = now()
WHERE name = 'plus';

-- Update Pro package - 3999 TL = 399900 kuruş
UPDATE packages
SET 
  price_monthly = 399900,
  price_yearly = 3999000,
  updated_at = now()
WHERE name = 'pro';

-- Verify the changes
SELECT 
  name,
  display_name_tr,
  price_monthly / 100.0 as price_monthly_tl,
  price_yearly / 100.0 as price_yearly_tl
FROM packages
WHERE name IN ('basic', 'plus', 'pro')
ORDER BY price_monthly;
