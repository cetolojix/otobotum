-- Add chatwoot_inbox_id column to instagram_connections table
ALTER TABLE instagram_connections
ADD COLUMN IF NOT EXISTS chatwoot_inbox_id INTEGER;

-- Add unique constraint for user_id and instagram_user_id
ALTER TABLE instagram_connections
ADD CONSTRAINT instagram_connections_user_instagram_unique 
UNIQUE (user_id, instagram_user_id);
