-- Check conversations table
SELECT 
  c.id as conversation_id,
  c.instance_id,
  c.contact_id,
  c.status,
  c.last_message_at,
  c.unread_count,
  c.created_at
FROM conversations c
ORDER BY c.created_at DESC
LIMIT 10;

-- Check instances table
SELECT 
  i.id as instance_id,
  i.instance_name,
  i.user_id,
  i.platform,
  i.status,
  i.created_at
FROM instances i
ORDER BY i.created_at DESC
LIMIT 10;

-- Check whatsapp_instances table
SELECT 
  w.id as whatsapp_instance_id,
  w.name,
  w.created_by,
  w.status,
  w.created_at
FROM whatsapp_instances w
ORDER BY w.created_at DESC
LIMIT 10;

-- Check if there's a relationship between conversations and instances
SELECT 
  c.id as conversation_id,
  c.instance_id,
  i.instance_name,
  i.platform,
  c.status as conversation_status,
  c.created_at
FROM conversations c
LEFT JOIN instances i ON c.instance_id = i.id
ORDER BY c.created_at DESC
LIMIT 10;

-- Check if there's a relationship between conversations and whatsapp_instances
SELECT 
  c.id as conversation_id,
  c.instance_id,
  w.name as whatsapp_instance_name,
  c.status as conversation_status,
  c.created_at
FROM conversations c
LEFT JOIN whatsapp_instances w ON c.instance_id = w.id
ORDER BY c.created_at DESC
LIMIT 10;
