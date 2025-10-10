-- Fix products table instance_id constraint
-- Make instance_id nullable since we're using instance_name instead

-- Drop the NOT NULL constraint from instance_id
ALTER TABLE products ALTER COLUMN instance_id DROP NOT NULL;

-- Add a comment explaining the change
COMMENT ON COLUMN products.instance_id IS 'Legacy column - use instance_name instead. Kept for backward compatibility but nullable.';

-- Optionally, you can also drop the foreign key constraint if it exists
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_instance_id_fkey;
