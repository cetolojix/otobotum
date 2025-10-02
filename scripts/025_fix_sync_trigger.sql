-- Fix the sync_conversation_contact_data trigger to preserve manually set values
-- The trigger was overwriting customer_phone and customer_name even when they were explicitly set

CREATE OR REPLACE FUNCTION sync_conversation_contact_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync from contacts if customer_phone and customer_name are NULL
  -- This allows manual setting of these values without contact_id
  IF NEW.contact_id IS NOT NULL AND (NEW.customer_phone IS NULL OR NEW.customer_name IS NULL) THEN
    UPDATE conversations
    SET 
      customer_phone = COALESCE(NEW.customer_phone, (SELECT phone_number FROM contacts WHERE id = NEW.contact_id)),
      customer_name = COALESCE(NEW.customer_name, (SELECT name FROM contacts WHERE id = NEW.contact_id))
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS sync_conversation_contact_trigger ON conversations;
CREATE TRIGGER sync_conversation_contact_trigger
AFTER INSERT OR UPDATE OF contact_id ON conversations
FOR EACH ROW
EXECUTE FUNCTION sync_conversation_contact_data();
