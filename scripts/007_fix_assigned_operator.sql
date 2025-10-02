-- Drop all existing versions of toggle_conversation_ai function
DROP FUNCTION IF EXISTS public.toggle_conversation_ai(UUID, BOOLEAN, UUID);
DROP FUNCTION IF EXISTS public.toggle_conversation_ai(TEXT, BOOLEAN, UUID);
DROP FUNCTION IF EXISTS public.toggle_conversation_ai(BOOLEAN, TEXT, UUID);
DROP FUNCTION IF EXISTS public.toggle_conversation_ai(BOOLEAN, UUID, UUID);

-- Create the correct version using assigned_operator (which exists in the database)
CREATE OR REPLACE FUNCTION public.toggle_conversation_ai(
  p_contact_id TEXT,
  p_ai_enabled BOOLEAN,
  p_operator_id UUID DEFAULT NULL
)
RETURNS TABLE (
  contact_id UUID,
  ai_enabled BOOLEAN,
  assigned_operator UUID,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the conversation using assigned_operator column (not operator_id)
  UPDATE conversations
  SET 
    ai_enabled = p_ai_enabled,
    assigned_operator = p_operator_id,
    updated_at = NOW()
  WHERE conversations.contact_id::text = p_contact_id;

  -- Return the updated conversation
  RETURN QUERY
  SELECT 
    conversations.contact_id,
    conversations.ai_enabled,
    conversations.assigned_operator,
    conversations.updated_at
  FROM conversations
  WHERE conversations.contact_id::text = p_contact_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.toggle_conversation_ai(TEXT, BOOLEAN, UUID) TO authenticated;
