-- Chatwoot inboxes table
CREATE TABLE IF NOT EXISTS chatwoot_inboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  chatwoot_inbox_id INTEGER NOT NULL,
  chatwoot_account_id INTEGER NOT NULL,
  inbox_name TEXT NOT NULL,
  channel_type TEXT NOT NULL DEFAULT 'api',
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, instance_name)
);

-- Chatwoot contacts table
CREATE TABLE IF NOT EXISTS chatwoot_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  chatwoot_contact_id INTEGER NOT NULL,
  chatwoot_account_id INTEGER NOT NULL,
  contact_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, instance_name, phone_number)
);

-- Chatwoot conversations table
CREATE TABLE IF NOT EXISTS chatwoot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  chatwoot_conversation_id INTEGER NOT NULL,
  chatwoot_inbox_id INTEGER NOT NULL,
  chatwoot_contact_id INTEGER NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, instance_name, phone_number)
);

-- Enable RLS
ALTER TABLE chatwoot_inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatwoot_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatwoot_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own chatwoot inboxes"
  ON chatwoot_inboxes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own chatwoot contacts"
  ON chatwoot_contacts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own chatwoot conversations"
  ON chatwoot_conversations FOR ALL
  USING (auth.uid() = user_id);
