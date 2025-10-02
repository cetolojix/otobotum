-- Fix toggle_conversation_ai function to use correct column name
-- The column is 'assigned_operator', not 'assigned_operator_id'

-- Drop existing function
DROP FUNCTION IF EXISTS toggle_conversation_ai(TEXT, BOOLEAN, UUID);

-- Create function with correct column name
CREATE OR REPLACE FUNCTION toggle_conversation_ai(
  p_conversation_id TEXT,
  p_ai_enabled BOOLEAN,
  p_operator_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the conversation with new AI status and operator
  UPDATE conversations
  SET 
    ai_enabled = p_ai_enabled,
    assigned_operator = p_operator_id,  -- Using correct column name 'assigned_operator'
    updated_at = NOW()
  WHERE id::text = p_conversation_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation with id % not found', p_conversation_id;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION toggle_conversation_ai(TEXT, BOOLEAN, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_conversation_ai(TEXT, BOOLEAN, UUID) TO anon;
