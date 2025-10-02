-- Drop the old function
DROP FUNCTION IF EXISTS toggle_conversation_ai(UUID, BOOLEAN, UUID);

-- Create the new function that uses contact_id instead of conversation UUID
CREATE OR REPLACE FUNCTION toggle_conversation_ai(
  p_contact_id TEXT,
  p_ai_enabled BOOLEAN,
  p_operator_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  contact_id TEXT,
  ai_enabled BOOLEAN,
  assigned_operator UUID,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Update the conversation using contact_id
  UPDATE conversations
  SET 
    ai_enabled = p_ai_enabled,
    assigned_operator = p_operator_id,
    updated_at = NOW()
  WHERE conversations.contact_id = p_contact_id;

  -- If disabling AI, add MANUAL tag
  IF NOT p_ai_enabled THEN
    UPDATE conversations
    SET tags = array_append(tags, 'MANUAL')
    WHERE conversations.contact_id = p_contact_id
    AND NOT ('MANUAL' = ANY(tags));
  ELSE
    -- If enabling AI, remove MANUAL tag
    UPDATE conversations
    SET tags = array_remove(tags, 'MANUAL')
    WHERE conversations.contact_id = p_contact_id;
  END IF;

  -- Return the updated conversation
  RETURN QUERY
  SELECT 
    conversations.id,
    conversations.contact_id,
    conversations.ai_enabled,
    conversations.assigned_operator,
    conversations.updated_at
  FROM conversations
  WHERE conversations.contact_id = p_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION toggle_conversation_ai TO authenticated;
