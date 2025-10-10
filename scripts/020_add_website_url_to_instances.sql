-- Add website_url column to whatsapp_instances table for product information scraping
-- This allows AI agent to fetch product information from the user's website

ALTER TABLE whatsapp_instances
ADD COLUMN IF NOT EXISTS website_url TEXT;

COMMENT ON COLUMN whatsapp_instances.website_url IS 'Website URL for AI agent to fetch product information';
