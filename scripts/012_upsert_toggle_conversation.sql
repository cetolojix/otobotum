-- Drop existing function
DROP FUNCTION IF EXISTS toggle_conversation_ai(TEXT, BOOLEAN, UUID);

-- Create new UPSERT function that creates conversation if it doesn't exist
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
  customer_phone TEXT,
  customer_name TEXT,
  instance_name TEXT
) AS $$
DECLARE
  v_conversation_id UUID;
  v_instance_id UUID;
BEGIN
  -- Get instance_id from instance_name
  SELECT i.id INTO v_instance_id
  FROM instances i
  WHERE i.instance_name = p_instance_name
  LIMIT 1;

  IF v_instance_id IS NULL THEN
    RAISE EXCEPTION 'Instance with name % not found', p_instance_name;
  END IF;

  -- Try to find existing conversation by customer_phone + instance_name
  SELECT c.id INTO v_conversation_id
  FROM conversations c
  WHERE c.customer_phone = p_customer_phone
    AND c.instance_name = p_instance_name
  LIMIT 1;

  -- If conversation doesn't exist, create it
  IF v_conversation_id IS NULL THEN
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
      p_customer_phone,
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
  ELSE
    -- Update existing conversation
    UPDATE conversations
    SET 
      ai_enabled = p_ai_enabled,
      assigned_operator = CASE WHEN p_ai_enabled THEN NULL ELSE p_operator_id END,
      updated_at = NOW()
    WHERE conversations.id = v_conversation_id;
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
END;
$$ LANGUAGE plpgsql;
