"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react"

const SQL_SCRIPT = `-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  max_instances INTEGER NOT NULL DEFAULT 1,
  max_messages_per_day INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id),
  status TEXT NOT NULL DEFAULT 'trial',
  iyzico_subscription_reference_code TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create trial_periods table
CREATE TABLE IF NOT EXISTS trial_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  status TEXT NOT NULL,
  iyzico_payment_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default packages
INSERT INTO packages (name, description, price, features, max_instances, max_messages_per_day)
VALUES 
  ('Başlangıç', 'Küçük işletmeler için ideal', 299.00, 
   '["1 WhatsApp numarası", "Günde 500 mesaj", "Temel AI özellikleri", "7/24 destek"]'::jsonb, 
   1, 500),
  ('Profesyonel', 'Büyüyen işletmeler için', 599.00,
   '["3 WhatsApp numarası", "Günde 2000 mesaj", "Gelişmiş AI özellikleri", "Öncelikli destek", "Özel entegrasyonlar"]'::jsonb,
   3, 2000),
  ('Kurumsal', 'Büyük ölçekli işletmeler için', 1299.00,
   '["10 WhatsApp numarası", "Sınırsız mesaj", "Tüm AI özellikleri", "Özel hesap yöneticisi", "API erişimi", "Özel geliştirmeler"]'::jsonb,
   10, 999999)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view packages" ON packages FOR SELECT USING (true);
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own trial" ON trial_periods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (auth.uid() = user_id);

-- Helper function to check subscription
CREATE OR REPLACE FUNCTION check_user_subscription(user_uuid UUID)
RETURNS TABLE (
  has_access BOOLEAN,
  subscription_status TEXT,
  package_name TEXT,
  trial_ends_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN us.status = 'active' THEN true
      WHEN tp.is_active AND tp.ends_at > NOW() THEN true
      ELSE false
    END as has_access,
    COALESCE(us.status, 'no_subscription') as subscription_status,
    p.name as package_name,
    tp.ends_at as trial_ends_at
  FROM auth.users u
  LEFT JOIN user_subscriptions us ON us.user_id = u.id
  LEFT JOIN packages p ON p.id = us.package_id
  LEFT JOIN trial_periods tp ON tp.user_id = u.id
  WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start trial
CREATE OR REPLACE FUNCTION start_trial_period()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trial_periods (user_id, ends_at)
  VALUES (NEW.id, NOW() + INTERVAL '7 days')
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO user_subscriptions (user_id, status)
  VALUES (NEW.id, 'trial')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create trial
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION start_trial_period();`

export default function SetupDatabasePage() {
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(SQL_SCRIPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/user/subscription-status")
      if (response.ok) {
        setTestResult({ success: true, message: "Veritabanı başarıyla kuruldu!" })
      } else {
        const error = await response.json()
        setTestResult({
          success: false,
          message: error.error || "Tablolar henüz oluşturulmamış",
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Bağlantı hatası. Lütfen SQL scriptini çalıştırın.",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Veritabanı Kurulumu</CardTitle>
          <CardDescription>
            Abonelik sistemini kullanmak için veritabanı tablolarını oluşturmanız gerekiyor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Aşağıdaki SQL scriptini Supabase dashboard'ınızda çalıştırarak gerekli tabloları oluşturun.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Adım 1: SQL Scriptini Kopyalayın</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                <code>{SQL_SCRIPT}</code>
              </pre>
              <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Kopyala
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Adım 2: Supabase Dashboard'da Çalıştırın</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Supabase Dashboard'a gidin</li>
              <li>Projenizi seçin (simerjuazakhwqgmnwkf)</li>
              <li>
                Sol menüden <strong>SQL Editor</strong> sekmesine tıklayın
              </li>
              <li>
                <strong>New Query</strong> butonuna tıklayın
              </li>
              <li>Kopyaladığınız SQL scriptini yapıştırın</li>
              <li>
                <strong>Run</strong> butonuna tıklayın
              </li>
            </ol>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Supabase Dashboard'ı Aç
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Adım 3: Kurulumu Test Edin</h3>
            <Button onClick={testConnection} disabled={testing} className="w-full">
              {testing ? "Test Ediliyor..." : "Bağlantıyı Test Et"}
            </Button>

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Script Ne Yapacak?</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                ✓ <strong>packages</strong> - 3 abonelik paketi (Başlangıç, Profesyonel, Kurumsal)
              </li>
              <li>
                ✓ <strong>user_subscriptions</strong> - Kullanıcı abonelikleri
              </li>
              <li>
                ✓ <strong>trial_periods</strong> - 7 günlük deneme süreleri
              </li>
              <li>
                ✓ <strong>payment_transactions</strong> - Ödeme kayıtları
              </li>
              <li>✓ RLS politikaları ve güvenlik ayarları</li>
              <li>✓ Yeni kullanıcılara otomatik deneme başlatma</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
