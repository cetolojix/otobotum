-- Add missing RLS policies for conversations and messages tables
-- These policies allow INSERT, UPDATE, and DELETE operations

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert conversations for their instances" ON conversations;
DROP POLICY IF EXISTS "Users can update their instance conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their instance conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can insert any conversation" ON conversations;
DROP POLICY IF EXISTS "Admins can update any conversation" ON conversations;
DROP POLICY IF EXISTS "Admins can delete any conversation" ON conversations;

DROP POLICY IF EXISTS "Users can insert messages for their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their conversation messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their conversation messages" ON messages;
DROP POLICY IF EXISTS "Admins can insert any message" ON messages;
DROP POLICY IF EXISTS "Admins can update any message" ON messages;
DROP POLICY IF EXISTS "Admins can delete any message" ON messages;

-- Conversations table policies

-- Users can insert conversations for their own instances
CREATE POLICY "Users can insert conversations for their instances" ON conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM instances i
      WHERE i.id = conversations.instance_id
      AND i.user_id = auth.uid()
    )
  );

-- Users can update conversations for their own instances
CREATE POLICY "Users can update their instance conversations" ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM instances i
      WHERE i.id = conversations.instance_id
      AND i.user_id = auth.uid()
    )
  );

-- Users can delete conversations for their own instances
CREATE POLICY "Users can delete their instance conversations" ON conversations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM instances i
      WHERE i.id = conversations.instance_id
      AND i.user_id = auth.uid()
    )
  );

-- Admins can insert any conversation
CREATE POLICY "Admins can insert any conversation" ON conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any conversation
CREATE POLICY "Admins can update any conversation" ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete any conversation
CREATE POLICY "Admins can delete any conversation" ON conversations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Messages table policies

-- Users can insert messages for their conversations
CREATE POLICY "Users can insert messages for their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN instances i ON c.instance_id = i.id
      WHERE c.id = messages.conversation_id
      AND i.user_id = auth.uid()
    )
  );

-- Users can update messages for their conversations
CREATE POLICY "Users can update their conversation messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN instances i ON c.instance_id = i.id
      WHERE c.id = messages.conversation_id
      AND i.user_id = auth.uid()
    )
  );

-- Users can delete messages for their conversations
CREATE POLICY "Users can delete their conversation messages" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN instances i ON c.instance_id = i.id
      WHERE c.id = messages.conversation_id
      AND i.user_id = auth.uid()
    )
  );

-- Admins can insert any message
CREATE POLICY "Admins can insert any message" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any message
CREATE POLICY "Admins can update any message" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete any message
CREATE POLICY "Admins can delete any message" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT INSERT, UPDATE, DELETE ON conversations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON messages TO authenticated;
