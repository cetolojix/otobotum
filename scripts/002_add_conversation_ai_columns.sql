-- Add missing columns to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS assigned_operator UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS operator_name TEXT,
ADD COLUMN IF NOT EXISTS total_messages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS human_handled_messages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_message TEXT,
ADD COLUMN IF NOT EXISTS instance_name TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_ai_enabled ON conversations(ai_enabled);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_operator ON conversations(assigned_operator);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_phone ON conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_conversations_instance_name ON conversations(instance_name);

-- Create or replace the toggle_conversation_ai function
CREATE OR REPLACE FUNCTION toggle_conversation_ai(
  p_conversation_id UUID,
  p_ai_enabled BOOLEAN,
  p_operator_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  ai_enabled BOOLEAN,
  assigned_operator UUID,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Update the conversation
  UPDATE conversations
  SET 
    ai_enabled = p_ai_enabled,
    assigned_operator = p_operator_id,
    updated_at = NOW()
  WHERE conversations.id = p_conversation_id;

  -- If disabling AI, add MANUAL tag
  IF NOT p_ai_enabled THEN
    UPDATE conversations
    SET tags = array_append(tags, 'MANUAL')
    WHERE conversations.id = p_conversation_id
    AND NOT ('MANUAL' = ANY(tags));
  ELSE
    -- If enabling AI, remove MANUAL tag
    UPDATE conversations
    SET tags = array_remove(tags, 'MANUAL')
    WHERE conversations.id = p_conversation_id;
  END IF;

  -- Return the updated conversation
  RETURN QUERY
  SELECT 
    conversations.id,
    conversations.ai_enabled,
    conversations.assigned_operator,
    conversations.updated_at
  FROM conversations
  WHERE conversations.id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION toggle_conversation_ai TO authenticated;

-- Create a function to sync conversation data from contacts
CREATE OR REPLACE FUNCTION sync_conversation_contact_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation with contact information
  UPDATE conversations
  SET 
    customer_phone = (SELECT phone_number FROM contacts WHERE id = NEW.contact_id),
    customer_name = (SELECT name FROM contacts WHERE id = NEW.contact_id)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync contact data
DROP TRIGGER IF EXISTS sync_conversation_contact_trigger ON conversations;
CREATE TRIGGER sync_conversation_contact_trigger
AFTER INSERT OR UPDATE OF contact_id ON conversations
FOR EACH ROW
EXECUTE FUNCTION sync_conversation_contact_data();

-- Update existing conversations with contact data
UPDATE conversations c
SET 
  customer_phone = ct.phone_number,
  customer_name = ct.name
FROM contacts ct
WHERE c.contact_id = ct.id
AND c.customer_phone IS NULL;

-- Update existing conversations with instance data
UPDATE conversations c
SET instance_name = i.instance_name
FROM instances i
WHERE c.instance_id = i.id
AND c.instance_name IS NULL;
