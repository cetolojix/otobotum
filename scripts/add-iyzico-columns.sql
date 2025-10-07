-- Sadece aylık plan için kolonlar ekleniyor, yıllık plan kaldırıldı
-- Add iyzico reference code columns to packages table
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS iyzico_product_code TEXT,
ADD COLUMN IF NOT EXISTS iyzico_monthly_plan_code TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_packages_iyzico_product ON packages(iyzico_product_code);
CREATE INDEX IF NOT EXISTS idx_packages_iyzico_monthly ON packages(iyzico_monthly_plan_code);
