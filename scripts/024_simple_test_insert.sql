-- Simplified test function to isolate the issue
CREATE OR REPLACE FUNCTION test_simple_insert(
  p_customer_phone TEXT,
  p_customer_name TEXT,
  p_instance_name TEXT
)
RETURNS TABLE (
  test_id UUID,
  test_phone CHARACTER VARYING,
  test_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_instance_id UUID;
  v_new_id UUID;
BEGIN
  -- Get instance_id
  SELECT id INTO v_instance_id
  FROM instances
  WHERE instance_name = p_instance_name
  AND user_id = auth.uid()
  LIMIT 1;

  IF v_instance_id IS NULL THEN
    RAISE EXCEPTION 'Instance not found';
  END IF;

  -- Simple INSERT with explicit values
  INSERT INTO conversations (
    id,
    instance_id,
    customer_phone,
    customer_name,
    instance_name,
    status,
    ai_enabled,
    unread_count,
    total_messages,
    human_handled_messages,
    created_at,
    updated_at,
    last_message_at
  ) VALUES (
    gen_random_uuid(),
    v_instance_id,
    p_customer_phone,
    p_customer_name,
    p_instance_name,
    'active',
    true,
    0,
    0,
    0,
    NOW(),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_new_id;

  -- Return the inserted values
  RETURN QUERY
  SELECT 
    id,
    customer_phone,
    customer_name
  FROM conversations
  WHERE id = v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION test_simple_insert TO authenticated;
