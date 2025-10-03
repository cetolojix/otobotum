-- iyzico Subscription System Tables
-- This script creates all necessary tables for the subscription system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Subscription Packages Table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  description TEXT,
  description_tr TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
  features JSONB DEFAULT '[]'::jsonb,
  max_instances INTEGER,
  max_contacts INTEGER,
  iyzico_product_reference_code TEXT UNIQUE,
  iyzico_pricing_plan_reference_code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  
  -- iyzico subscription details
  iyzico_subscription_reference_code TEXT UNIQUE,
  iyzico_customer_reference_code TEXT,
  
  -- Subscription status
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'canceled', 'expired')),
  
  -- Trial information
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  is_trial_used BOOLEAN DEFAULT false,
  
  -- Subscription dates
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  
  -- Cancellation
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 3. Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  
  -- iyzico payment details
  iyzico_payment_id TEXT,
  iyzico_conversation_id TEXT,
  
  -- Transaction details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_method TEXT,
  
  -- Error handling
  error_code TEXT,
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trial Periods Table (for tracking 7-day trials)
CREATE TABLE IF NOT EXISTS trial_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_iyzico_ref ON user_subscriptions(iyzico_subscription_reference_code);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_trial_periods_user_id ON trial_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);

-- Enable Row Level Security
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packages (public read)
CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trial_periods
CREATE POLICY "Users can view their own trial periods"
  ON trial_periods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trial periods"
  ON trial_periods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert default packages
INSERT INTO packages (name, name_tr, description, description_tr, price, billing_period, max_instances, max_contacts, features)
VALUES 
  (
    'Starter',
    'Başlangıç',
    'Perfect for small businesses',
    'Küçük işletmeler için ideal',
    299.00,
    'monthly',
    3,
    1000,
    '["3 WhatsApp instances", "1000 contacts", "Basic automation", "Email support"]'::jsonb
  ),
  (
    'Professional',
    'Profesyonel',
    'For growing businesses',
    'Büyüyen işletmeler için',
    599.00,
    'monthly',
    10,
    5000,
    '["10 WhatsApp instances", "5000 contacts", "Advanced automation", "Priority support", "Custom workflows"]'::jsonb
  ),
  (
    'Enterprise',
    'Kurumsal',
    'For large organizations',
    'Büyük organizasyonlar için',
    1299.00,
    'monthly',
    NULL,
    NULL,
    '["Unlimited instances", "Unlimited contacts", "Full automation suite", "24/7 support", "Custom integrations", "Dedicated account manager"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = p_user_id
    AND status IN ('trial', 'active')
    AND (
      (status = 'trial' AND trial_end_date > NOW())
      OR (status = 'active' AND subscription_end_date > NOW())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current subscription limits
CREATE OR REPLACE FUNCTION get_subscription_limits(p_user_id UUID)
RETURNS TABLE (
  max_instances INTEGER,
  max_contacts INTEGER,
  package_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.max_instances,
    p.max_contacts,
    p.name_tr
  FROM user_subscriptions us
  JOIN packages p ON us.package_id = p.id
  WHERE us.user_id = p_user_id
  AND us.status IN ('trial', 'active')
  AND (
    (us.status = 'trial' AND us.trial_end_date > NOW())
    OR (us.status = 'active' AND us.subscription_end_date > NOW())
  )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start trial period
CREATE OR REPLACE FUNCTION start_trial_period(p_user_id UUID, p_package_id UUID)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_trial_end_date TIMESTAMPTZ;
BEGIN
  -- Calculate trial end date (7 days from now)
  v_trial_end_date := NOW() + INTERVAL '7 days';
  
  -- Create trial period record
  INSERT INTO trial_periods (user_id, end_date)
  VALUES (p_user_id, v_trial_end_date)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create subscription record
  INSERT INTO user_subscriptions (
    user_id,
    package_id,
    status,
    trial_start_date,
    trial_end_date,
    is_trial_used
  )
  VALUES (
    p_user_id,
    p_package_id,
    'trial',
    NOW(),
    v_trial_end_date,
    true
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    package_id = p_package_id,
    status = 'trial',
    trial_start_date = NOW(),
    trial_end_date = v_trial_end_date,
    updated_at = NOW()
  RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
