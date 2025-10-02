-- Drop the old function that expects UUID
DROP FUNCTION IF EXISTS toggle_conversation_ai(UUID, BOOLEAN, UUID);

-- Create the function with TEXT conversation_id parameter
CREATE OR REPLACE FUNCTION toggle_conversation_ai(
  p_conversation_id TEXT,
  p_ai_enabled BOOLEAN,
  p_operator_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  ai_enabled BOOLEAN,
  assigned_operator UUID
) AS $$
BEGIN
  -- Update the conversation by comparing id as text
  UPDATE conversations
  SET 
    ai_enabled = p_ai_enabled,
    assigned_operator = CASE 
      WHEN p_ai_enabled = false THEN p_operator_id
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE conversations.id::text = p_conversation_id;

  -- Return the updated conversation
  RETURN QUERY
  SELECT 
    conversations.id,
    conversations.ai_enabled,
    conversations.assigned_operator
  FROM conversations
  WHERE conversations.id::text = p_conversation_id;
END;
$$ LANGUAGE plpgsql;
