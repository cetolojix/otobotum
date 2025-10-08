-- Google Sheets Integration Tables
-- This script creates tables for storing Google Sheets configuration per instance

-- Drop existing tables if they exist
DROP TABLE IF EXISTS google_sheets_config CASCADE;
DROP TABLE IF EXISTS google_sheets_orders CASCADE;

-- Create google_sheets_config table
CREATE TABLE IF NOT EXISTS google_sheets_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  spreadsheet_id TEXT NOT NULL,
  sheet_name TEXT NOT NULL DEFAULT 'Siparişler',
  service_account_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, instance_name)
);

-- Create google_sheets_orders table for logging
CREATE TABLE IF NOT EXISTS google_sheets_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES google_sheets_config(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  order_details TEXT NOT NULL,
  order_amount DECIMAL(10, 2),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_to_sheets BOOLEAN DEFAULT false,
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_sheets_config_user_id ON google_sheets_config(user_id);
CREATE INDEX IF NOT EXISTS idx_google_sheets_config_instance ON google_sheets_config(instance_name);
CREATE INDEX IF NOT EXISTS idx_google_sheets_orders_config_id ON google_sheets_orders(config_id);
CREATE INDEX IF NOT EXISTS idx_google_sheets_orders_instance ON google_sheets_orders(instance_name);
CREATE INDEX IF NOT EXISTS idx_google_sheets_orders_synced ON google_sheets_orders(synced_to_sheets);

-- Enable RLS
ALTER TABLE google_sheets_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_sheets_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_sheets_config
CREATE POLICY "Users can view their own Google Sheets configs"
  ON google_sheets_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google Sheets configs"
  ON google_sheets_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Sheets configs"
  ON google_sheets_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Sheets configs"
  ON google_sheets_config FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for google_sheets_orders
CREATE POLICY "Users can view their own orders"
  ON google_sheets_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM google_sheets_config
      WHERE google_sheets_config.id = google_sheets_orders.config_id
      AND google_sheets_config.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert orders"
  ON google_sheets_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update orders"
  ON google_sheets_orders FOR UPDATE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_sheets_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_google_sheets_config_updated_at_trigger ON google_sheets_config;
CREATE TRIGGER update_google_sheets_config_updated_at_trigger
  BEFORE UPDATE ON google_sheets_config
  FOR EACH ROW
  EXECUTE FUNCTION update_google_sheets_config_updated_at();

-- Grant permissions
GRANT ALL ON google_sheets_config TO authenticated;
GRANT ALL ON google_sheets_orders TO authenticated;
GRANT ALL ON google_sheets_config TO service_role;
GRANT ALL ON google_sheets_orders TO service_role;

COMMENT ON TABLE google_sheets_config IS 'Stores Google Sheets configuration for each WhatsApp instance';
COMMENT ON TABLE google_sheets_orders IS 'Logs all orders synced to Google Sheets';
