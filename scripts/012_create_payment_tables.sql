-- =====================================================
-- PAYMENT SYSTEM TABLES FOR IYZICO INTEGRATION
-- =====================================================

-- 1. Create packages table (subscription plans)
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  monthly_price DECIMAL(10,2) NOT NULL,
  yearly_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  
  -- Features and limits
  max_instances INTEGER NOT NULL DEFAULT 1,
  max_messages_per_day INTEGER NOT NULL DEFAULT 100,
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Package metadata
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id),
  
  -- Subscription details
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Trial information
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Subscription dates
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment tracking
  last_payment_id UUID,
  auto_renew BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one active subscription per user
  UNIQUE(user_id, status) WHERE status = 'active'
);

-- 3. Create payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id),
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  
  -- iyzico specific fields
  payment_id TEXT UNIQUE,
  conversation_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Card info (masked)
  card_family TEXT,
  card_association TEXT,
  card_last_four TEXT,
  
  -- iyzico response data
  iyzico_response JSONB,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- 4. Create trial periods table
CREATE TABLE IF NOT EXISTS public.trial_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  is_trial_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_periods ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR PACKAGES
-- =====================================================

CREATE POLICY "Anyone can view active packages" ON public.packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON public.packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES FOR USER_SUBSCRIPTIONS
-- =====================================================

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES FOR PAYMENT_TRANSACTIONS
-- =====================================================

CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES FOR TRIAL_PERIODS
-- =====================================================

CREATE POLICY "Users can view their own trial" ON public.trial_periods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trial" ON public.trial_periods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all trials" ON public.trial_periods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_packages_active ON public.packages(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON public.user_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON public.payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_trial_periods_user_id ON public.trial_periods(user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO subscription_count
  FROM public.user_subscriptions
  WHERE user_id = user_uuid 
    AND status = 'active' 
    AND end_date > NOW();
  
  RETURN subscription_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is in trial period
CREATE OR REPLACE FUNCTION public.is_user_in_trial(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trial_record RECORD;
BEGIN
  SELECT * INTO trial_record
  FROM public.trial_periods
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    -- No trial record exists, user can start trial
    RETURN true;
  END IF;
  
  -- Check if trial is still valid
  IF trial_record.trial_end_date > NOW() AND NOT trial_record.is_trial_used THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current package limits
CREATE OR REPLACE FUNCTION public.get_user_package_limits(user_uuid UUID)
RETURNS TABLE (
  max_instances INTEGER,
  max_messages_per_day INTEGER,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.max_instances,
    p.max_messages_per_day,
    p.features
  FROM public.user_subscriptions us
  JOIN public.packages p ON us.package_id = p.id
  WHERE us.user_id = user_uuid 
    AND us.status = 'active' 
    AND us.end_date > NOW()
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_in_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_package_limits(UUID) TO authenticated;

-- =====================================================
-- INSERT DEFAULT PACKAGES
-- =====================================================

INSERT INTO public.packages (name, description, monthly_price, yearly_price, max_instances, max_messages_per_day, features, display_order)
VALUES 
  (
    'Başlangıç',
    'Küçük işletmeler için ideal başlangıç paketi',
    299.00,
    2990.00,
    3,
    1000,
    '["Temel AI yanıtları", "3 WhatsApp numarası", "Günde 1000 mesaj", "E-posta desteği"]'::jsonb,
    1
  ),
  (
    'Profesyonel',
    'Büyüyen işletmeler için gelişmiş özellikler',
    599.00,
    5990.00,
    10,
    5000,
    '["Gelişmiş AI yanıtları", "10 WhatsApp numarası", "Günde 5000 mesaj", "Öncelikli destek", "Özel entegrasyonlar", "Detaylı analitik"]'::jsonb,
    2
  ),
  (
    'Kurumsal',
    'Büyük ölçekli işletmeler için sınırsız çözüm',
    1499.00,
    14990.00,
    999,
    999999,
    '["Premium AI yanıtları", "Sınırsız WhatsApp numarası", "Sınırsız mesaj", "7/24 destek", "Özel entegrasyonlar", "Gelişmiş analitik", "API erişimi", "Özel eğitim"]'::jsonb,
    3
  )
ON CONFLICT DO NOTHING;
