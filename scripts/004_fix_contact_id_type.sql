-- Fix contact_id column type from UUID to TEXT
-- This is necessary because WhatsApp contact IDs are text strings, not UUIDs

-- First, drop any foreign key constraints on contact_id
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_contact_id_fkey;

-- Drop any indexes on contact_id
DROP INDEX IF EXISTS idx_conversations_contact_id;

-- Change contact_id column type from UUID to TEXT
ALTER TABLE conversations
ALTER COLUMN contact_id TYPE TEXT USING contact_id::TEXT;

-- Recreate index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);

-- Add a comment to document the column
COMMENT ON COLUMN conversations.contact_id IS 'WhatsApp contact ID in format: phone@s.whatsapp.net';
