-- Add debug logging to understand why customer data is NULL
-- This will help us identify if the issue is with parameters or database constraints

DROP FUNCTION IF EXISTS toggle_conversation_ai(TEXT, TEXT, TEXT, BOOLEAN, UUID);

CREATE OR REPLACE FUNCTION toggle_conversation_ai(
  p_customer_phone TEXT,
  p_instance_name TEXT,
  p_customer_name TEXT,
  p_ai_enabled BOOLEAN,
  p_operator_id UUID
)
RETURNS TABLE (
  id UUID,
  ai_enabled BOOLEAN,
  assigned_operator UUID,
  customer_phone CHARACTER VARYING,
  customer_name TEXT,
  instance_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_instance_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Debug: Log parameters
  RAISE NOTICE 'Parameters: phone=%, name=%, instance=%, ai=%, operator=%', 
    p_customer_phone, p_customer_name, p_instance_name, p_ai_enabled, p_operator_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get instance_id from instance_name and verify ownership
  SELECT i.id INTO v_instance_id
  FROM instances i
  WHERE i.instance_name = p_instance_name
    AND i.user_id = v_user_id
  LIMIT 1;

  IF v_instance_id IS NULL THEN
    RAISE EXCEPTION 'Instance with name % not found or access denied', p_instance_name;
  END IF;
  
  RAISE NOTICE 'Found instance_id: %', v_instance_id;

  -- Try to find existing conversation
  SELECT c.id INTO v_conversation_id
  FROM conversations c
  WHERE c.customer_phone = p_customer_phone::CHARACTER VARYING
    AND c.instance_id = v_instance_id
  LIMIT 1;
  
  RAISE NOTICE 'Existing conversation_id: %', v_conversation_id;

  -- If conversation doesn't exist, create it
  IF v_conversation_id IS NULL THEN
    RAISE NOTICE 'Creating new conversation with phone=%, name=%', p_customer_phone, p_customer_name;
    
    INSERT INTO conversations (
      instance_id,
      customer_phone,
      customer_name,
      instance_name,
      ai_enabled,
      assigned_operator,
      status,
      unread_count,
      total_messages,
      human_handled_messages,
      created_at,
      updated_at,
      last_message_at
    ) VALUES (
      v_instance_id,
      p_customer_phone::CHARACTER VARYING,
      p_customer_name,
      p_instance_name,
      p_ai_enabled,
      CASE WHEN p_ai_enabled THEN NULL ELSE p_operator_id END,
      'active',
      0,
      0,
      0,
      NOW(),
      NOW(),
      NOW()
    )
    RETURNING conversations.id INTO v_conversation_id;
    
    RAISE NOTICE 'Created conversation_id: %', v_conversation_id;
  ELSE
    -- Update existing conversation
    UPDATE conversations
    SET 
      ai_enabled = p_ai_enabled,
      assigned_operator = CASE WHEN p_ai_enabled THEN NULL ELSE p_operator_id END,
      customer_name = COALESCE(p_customer_name, customer_name),
      updated_at = NOW()
    WHERE conversations.id = v_conversation_id;
    
    RAISE NOTICE 'Updated conversation_id: %', v_conversation_id;
  END IF;

  -- Return the conversation
  RETURN QUERY
  SELECT 
    c.id,
    c.ai_enabled,
    c.assigned_operator,
    c.customer_phone,
    c.customer_name,
    c.instance_name
  FROM conversations c
  WHERE c.id = v_conversation_id;
  
  -- Debug: Log what we're returning
  RAISE NOTICE 'Returning conversation with phone=%, name=%', 
    (SELECT customer_phone FROM conversations WHERE id = v_conversation_id),
    (SELECT customer_name FROM conversations WHERE id = v_conversation_id);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION toggle_conversation_ai(TEXT, TEXT, TEXT, BOOLEAN, UUID) TO authenticated;
