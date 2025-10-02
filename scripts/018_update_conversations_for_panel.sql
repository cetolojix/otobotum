-- Update conversations and messages tables for WhatsApp panel features

-- Add missing columns to conversations table if they don't exist
DO $$ 
BEGIN
  -- Add ai_enabled column (for human intervention toggle)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='ai_enabled') THEN
    ALTER TABLE conversations ADD COLUMN ai_enabled BOOLEAN DEFAULT true;
  END IF;

  -- Add assigned_operator column (for human handoff)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='assigned_operator') THEN
    ALTER TABLE conversations ADD COLUMN assigned_operator UUID REFERENCES auth.users(id);
  END IF;

  -- Add tags column (for labeling conversations)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='tags') THEN
    ALTER TABLE conversations ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- Add customer_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='customer_name') THEN
    ALTER TABLE conversations ADD COLUMN customer_name TEXT;
  END IF;

  -- Add customer_phone column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='customer_phone') THEN
    ALTER TABLE conversations ADD COLUMN customer_phone TEXT;
  END IF;
END $$;

-- Update messages table to track who handled the message
DO $$ 
BEGIN
  -- Add handled_by column (ai, human, system)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='handled_by') THEN
    ALTER TABLE messages ADD COLUMN handled_by TEXT DEFAULT 'ai' CHECK (handled_by IN ('ai', 'human', 'system'));
  END IF;

  -- Add operator_id column (which operator handled the message)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='operator_id') THEN
    ALTER TABLE messages ADD COLUMN operator_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_ai_enabled ON conversations(ai_enabled);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_operator ON conversations(assigned_operator);
CREATE INDEX IF NOT EXISTS idx_conversations_tags ON conversations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_phone ON conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_messages_handled_by ON messages(handled_by);
CREATE INDEX IF NOT EXISTS idx_messages_operator_id ON messages(operator_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp ON messages(conversation_id, timestamp DESC);

-- Create a view for easy conversation monitoring
CREATE OR REPLACE VIEW conversation_monitor AS
SELECT 
  c.id,
  c.instance_id,
  c.customer_phone,
  c.customer_name,
  c.status,
  c.ai_enabled,
  c.assigned_operator,
  c.tags,
  c.last_message_at,
  c.unread_count,
  c.created_at,
  c.updated_at,
  i.instance_name,
  i.user_id as instance_owner_id,
  p.full_name as operator_name,
  p.email as operator_email,
  (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as total_messages,
  (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.handled_by = 'human') as human_handled_messages,
  (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.timestamp DESC LIMIT 1) as last_message
FROM conversations c
LEFT JOIN instances i ON c.instance_id = i.id
LEFT JOIN profiles p ON c.assigned_operator = p.id;

-- Grant permissions
GRANT SELECT ON conversation_monitor TO authenticated;

-- Create function to toggle AI for a conversation
CREATE OR REPLACE FUNCTION toggle_conversation_ai(
  p_conversation_id UUID,
  p_ai_enabled BOOLEAN,
  p_operator_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update conversation
  UPDATE conversations
  SET 
    ai_enabled = p_ai_enabled,
    assigned_operator = CASE WHEN p_ai_enabled = false THEN p_operator_id ELSE NULL END,
    tags = CASE 
      WHEN p_ai_enabled = false AND NOT ('MANUAL' = ANY(tags)) THEN array_append(tags, 'MANUAL')
      WHEN p_ai_enabled = true THEN array_remove(tags, 'MANUAL')
      ELSE tags
    END,
    updated_at = NOW()
  WHERE id = p_conversation_id;

  -- Log the change in human_handoff_requests if switching to manual
  IF p_ai_enabled = false THEN
    INSERT INTO human_handoff_requests (
      conversation_id,
      customer_phone,
      instance_name,
      status,
      assigned_at,
      support_phone
    )
    SELECT 
      c.id,
      c.customer_phone,
      i.instance_name,
      'assigned',
      NOW(),
      p.phone
    FROM conversations c
    LEFT JOIN instances i ON c.instance_id = i.id
    LEFT JOIN profiles p ON p.id = p_operator_id
    WHERE c.id = p_conversation_id;
  END IF;

  -- Return updated conversation
  SELECT jsonb_build_object(
    'success', true,
    'conversation_id', p_conversation_id,
    'ai_enabled', p_ai_enabled,
    'operator_id', p_operator_id
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Create function to add tags to conversation
CREATE OR REPLACE FUNCTION add_conversation_tag(
  p_conversation_id UUID,
  p_tag TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE conversations
  SET 
    tags = array_append(tags, p_tag),
    updated_at = NOW()
  WHERE id = p_conversation_id
  AND NOT (p_tag = ANY(tags));

  RETURN jsonb_build_object(
    'success', true,
    'conversation_id', p_conversation_id,
    'tag', p_tag
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION toggle_conversation_ai TO authenticated;
GRANT EXECUTE ON FUNCTION add_conversation_tag TO authenticated;

-- Add RLS policies for conversation_monitor view
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view conversations for their instances
CREATE POLICY "Users can view their instance conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM instances i
      WHERE i.id = conversations.instance_id
      AND i.user_id = auth.uid()
    )
  );

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view messages for their conversations
CREATE POLICY "Users can view their conversation messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN instances i ON c.instance_id = i.id
      WHERE c.id = messages.conversation_id
      AND i.user_id = auth.uid()
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
