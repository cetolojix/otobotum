-- Drop existing function completely
DROP FUNCTION IF EXISTS toggle_conversation_ai(boolean, uuid, uuid);
DROP FUNCTION IF EXISTS toggle_conversation_ai(uuid, boolean, uuid);
DROP FUNCTION IF EXISTS toggle_conversation_ai(text, boolean, uuid);

-- Create the function with correct parameter names and types
CREATE OR REPLACE FUNCTION toggle_conversation_ai(
  p_conversation_id TEXT,
  p_ai_enabled BOOLEAN,
  p_operator_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the conversation
  UPDATE conversations
  SET 
    ai_enabled = p_ai_enabled,
    assigned_operator_id = p_operator_id,
    updated_at = NOW()
  WHERE id::text = p_conversation_id;
  
  -- Log the change
  RAISE NOTICE 'Conversation % AI toggled to % with operator %', p_conversation_id, p_ai_enabled, p_operator_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION toggle_conversation_ai(TEXT, BOOLEAN, UUID) TO authenticated;
