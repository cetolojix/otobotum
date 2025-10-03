-- iyzico Native Subscription System
-- This replaces the manual payment tracking with iyzico's built-in subscription management

-- Drop old tables if they exist
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS trial_periods CASCADE;

-- Subscription packages (our internal package definitions)
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name_tr VARCHAR(100) NOT NULL,
  display_name_en VARCHAR(100) NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  max_instances INTEGER NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  
  -- iyzico product and plan references
  iyzico_product_reference_code VARCHAR(100),
  iyzico_monthly_plan_reference_code VARCHAR(100),
  iyzico_yearly_plan_reference_code VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions (tracks iyzico subscription status)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id),
  
  -- iyzico subscription details
  iyzico_subscription_reference_code VARCHAR(100) UNIQUE,
  iyzico_customer_reference_code VARCHAR(100),
  
  -- Subscription status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  billing_cycle VARCHAR(10) CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Trial information
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, package_id)
);

-- iyzico webhook events log
CREATE TABLE IF NOT EXISTS iyzico_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  subscription_reference_code VARCHAR(100),
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trial periods tracking
CREATE TABLE IF NOT EXISTS trial_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default packages
INSERT INTO packages (name, display_name_tr, display_name_en, description_tr, description_en, max_instances, price_monthly, price_yearly, features) VALUES
('starter', 'Başlangıç', 'Starter', 'Küçük işletmeler için ideal', 'Perfect for small businesses', 3, 299.00, 2990.00, 
 '["3 WhatsApp instance", "Temel AI özellikleri", "1000 mesaj/ay", "Email destek"]'::jsonb),
('professional', 'Profesyonel', 'Professional', 'Büyüyen işletmeler için', 'For growing businesses', 10, 799.00, 7990.00,
 '["10 WhatsApp instance", "Gelişmiş AI özellikleri", "10000 mesaj/ay", "Öncelikli destek", "Özel entegrasyonlar"]'::jsonb),
('enterprise', 'Kurumsal', 'Enterprise', 'Büyük ölçekli işletmeler için', 'For large-scale businesses', 50, 1999.00, 19990.00,
 '["50 WhatsApp instance", "Tüm AI özellikleri", "Sınırsız mesaj", "7/24 destek", "Özel geliştirme", "SLA garantisi"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_iyzico_ref ON user_subscriptions(iyzico_subscription_reference_code);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON iyzico_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_trial_periods_user_id ON trial_periods(user_id);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE iyzico_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active packages" ON packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own trial periods" ON trial_periods
  FOR SELECT USING (auth.uid() = user_id);

-- Function to check if user has active subscription or trial
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  ) OR EXISTS (
    SELECT 1 FROM trial_periods
    WHERE user_id = user_uuid
    AND is_active = true
    AND ends_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current package
CREATE OR REPLACE FUNCTION get_user_package(user_uuid UUID)
RETURNS TABLE (
  package_id UUID,
  package_name VARCHAR,
  max_instances INTEGER,
  is_trial BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.max_instances,
    COALESCE(us.is_trial, false)
  FROM user_subscriptions us
  JOIN packages p ON p.id = us.package_id
  WHERE us.user_id = user_uuid
  AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create trial period for new users
CREATE OR REPLACE FUNCTION create_trial_period()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trial_periods (user_id, ends_at)
  VALUES (NEW.id, NOW() + INTERVAL '7 days')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create trial for new users
DROP TRIGGER IF EXISTS on_user_created_trial ON auth.users;
CREATE TRIGGER on_user_created_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_period();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF NOT EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
