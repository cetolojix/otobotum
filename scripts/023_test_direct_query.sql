-- Test script to check what's actually in the conversations table
-- This will help us understand if the data is being inserted correctly

-- First, let's see the last 5 conversations created
SELECT 
  id,
  customer_phone,
  customer_name,
  instance_name,
  ai_enabled,
  assigned_operator,
  created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 5;

-- Check if there are any triggers on the conversations table
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'conversations';

-- Check RLS policies on conversations table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'conversations';
