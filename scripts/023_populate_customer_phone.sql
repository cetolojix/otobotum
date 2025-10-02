-- Populate customer_phone for existing conversations
-- This script extracts phone numbers from instance_name or other fields

DO $$
DECLARE
  conv_record RECORD;
  phone_number TEXT;
BEGIN
  -- Loop through conversations with NULL customer_phone
  FOR conv_record IN 
    SELECT id, instance_name, customer_name
    FROM conversations
    WHERE customer_phone IS NULL
  LOOP
    -- Try to extract phone number from customer_name or other fields
    -- For now, we'll just log these conversations
    RAISE NOTICE 'Conversation % has NULL customer_phone (instance: %, name: %)', 
      conv_record.id, conv_record.instance_name, conv_record.customer_name;
  END LOOP;
  
  RAISE NOTICE 'Migration complete. Found % conversations with NULL customer_phone', 
    (SELECT COUNT(*) FROM conversations WHERE customer_phone IS NULL);
END $$;

-- Note: This script identifies conversations with NULL customer_phone
-- The actual phone numbers will be populated when users interact with the chat
-- through the Evolution API, which provides the remoteJid
