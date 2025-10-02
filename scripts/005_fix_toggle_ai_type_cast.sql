-- Fix toggle_conversation_ai function to handle type casting properly
-- This allows the function to work with both UUID and TEXT contact_id types

-- Drop the existing function
DROP FUNCTION IF EXISTS toggle_conversation_ai(boolean, text, uuid);

-- Recreate the function with proper type casting
CREATE OR REPLACE FUNCTION toggle_conversation_ai(
  p_ai_enabled boolean,
  p_contact_id text,
  p_operator_id uuid DEFAULT NULL
)
RETURNS TABLE (
  contact_id text,
  ai_enabled boolean,
  assigned_operator uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the conversation with explicit type casting
  UPDATE conversations
  SET 
    ai_enabled = p_ai_enabled,
    assigned_operator = CASE 
      WHEN p_ai_enabled = false THEN p_operator_id 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE conversations.contact_id::text = p_contact_id;
  
  -- Return the updated conversation
  RETURN QUERY
  SELECT 
    conversations.contact_id::text,
    conversations.ai_enabled,
    conversations.assigned_operator
  FROM conversations
  WHERE conversations.contact_id::text = p_contact_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION toggle_conversation_ai(boolean, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_conversation_ai(boolean, text, uuid) TO anon;
