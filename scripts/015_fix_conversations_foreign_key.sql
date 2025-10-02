-- Fix conversations table foreign key to reference instances table instead of whatsapp_instances

-- Drop the old foreign key constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'conversations_instance_id_fkey' 
    AND table_name = 'conversations'
  ) THEN
    ALTER TABLE conversations DROP CONSTRAINT conversations_instance_id_fkey;
  END IF;
END $$;

-- Add new foreign key constraint to instances table
ALTER TABLE conversations 
  ADD CONSTRAINT conversations_instance_id_fkey 
  FOREIGN KEY (instance_id) 
  REFERENCES instances(id) 
  ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_instance_id ON conversations(instance_id);
