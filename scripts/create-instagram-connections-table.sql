-- Create instagram_connections table
CREATE TABLE IF NOT EXISTS instagram_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL,
  instagram_username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  account_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, instagram_user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_instagram_connections_user_id ON instagram_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_connections_instagram_user_id ON instagram_connections(instagram_user_id);

-- Enable RLS
ALTER TABLE instagram_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own Instagram connections"
  ON instagram_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Instagram connections"
  ON instagram_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Instagram connections"
  ON instagram_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Instagram connections"
  ON instagram_connections FOR DELETE
  USING (auth.uid() = user_id);
