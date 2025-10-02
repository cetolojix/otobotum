-- Add detailed debug logging to understand why customer_phone and customer_name are NULL

DROP FUNCTION IF EXISTS toggle_conversation_ai(TEXT, TEXT, TEXT, BOOLEAN, UUID);

CREATE OR REPLACE FUNCTION toggle_conversation_ai(
  p_customer_phone TEXT,
  p_instance_name TEXT,
  p_customer_name TEXT,
  p_ai_enabled BOOLEAN,
  p_operator_id UUID
)
RETURNS TABLE (
  out_id UUID,
  out_ai_enabled BOOLEAN,
  out_assigned_operator UUID,
  out_customer_phone CHARACTER VARYING,
  out_customer_name TEXT,
  out_instance_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_instance_id UUID;
  v_user_id UUID;
  v_debug_phone CHARACTER VARYING;
  v_debug_name TEXT;
BEGIN
  -- Debug: Log input parameters
  RAISE NOTICE 'INPUT PARAMS: phone=%, name=%, instance=%', p_customer_phone, p_customer_name, p_instance_name;
  
  -- Get current user ID
  v_user_id := auth.uid();
  
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
    RETURNING id, customer_phone, customer_name INTO v_conversation_id, v_debug_phone, v_debug_name;
    
    RAISE NOTICE 'INSERT RETURNING: id=%, phone=%, name=%', v_conversation_id, v_debug_phone, v_debug_name;
  ELSE
    RAISE NOTICE 'Updating existing conversation: %', v_conversation_id;
    
    -- Update existing conversation
    UPDATE conversations c
    SET 
      ai_enabled = p_ai_enabled,
      assigned_operator = CASE WHEN p_ai_enabled THEN NULL ELSE p_operator_id END,
      customer_name = COALESCE(p_customer_name, c.customer_name),
      updated_at = NOW()
    WHERE c.id = v_conversation_id;
  END IF;

  -- Debug: Check what's actually in the database
  SELECT c.customer_phone, c.customer_name INTO v_debug_phone, v_debug_name
  FROM conversations c
  WHERE c.id = v_conversation_id;
  
  RAISE NOTICE 'DATABASE VALUES: phone=%, name=%', v_debug_phone, v_debug_name;

  -- Return the conversation with explicit column aliases to match output names
  RETURN QUERY
  SELECT 
    c.id AS out_id,
    c.ai_enabled AS out_ai_enabled,
    c.assigned_operator AS out_assigned_operator,
    c.customer_phone AS out_customer_phone,
    c.customer_name AS out_customer_name,
    c.instance_name AS out_instance_name
  FROM conversations c
  WHERE c.id = v_conversation_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION toggle_conversation_ai(TEXT, TEXT, TEXT, BOOLEAN, UUID) TO authenticated;
