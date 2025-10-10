-- Add instance_name column to products table and remove instance_id dependency
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS instance_name VARCHAR(255);

-- Create index on instance_name for better query performance
CREATE INDEX IF NOT EXISTS idx_products_instance_name ON products(instance_name);

-- Update existing products to use instance_name from whatsapp_instances
UPDATE products p
SET instance_name = wi.name
FROM whatsapp_instances wi
WHERE p.instance_id = wi.id
AND p.instance_name IS NULL;

-- Make instance_name NOT NULL after migration
ALTER TABLE products 
ALTER COLUMN instance_name SET NOT NULL;
