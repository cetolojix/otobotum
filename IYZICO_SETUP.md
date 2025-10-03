# iyzico Ödeme Entegrasyonu Kurulum Rehberi

Bu dokümantasyon, WhatsApp AI Automation platformuna iyzico ödeme altyapısının nasıl entegre edildiğini açıklar.

## Gerekli Environment Variables

Aşağıdaki environment variable'ları Vercel projenize eklemeniz gerekmektedir:

\`\`\`bash
# iyzico API Credentials
IYZICO_API_KEY=your_api_key_here
IYZICO_SECRET_KEY=your_secret_key_here
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com  # Production için: https://api.iyzipay.com

# Site URL (callback için gerekli)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Cron Job Secret (opsiyonel, güvenlik için önerilir)
CRON_SECRET=your_random_secret_here
\`\`\`

## iyzico Hesap Kurulumu

1. **iyzico Hesabı Oluşturun**
   - https://www.iyzico.com adresinden kayıt olun
   - İşletme bilgilerinizi tamamlayın
   - Doğrulama sürecini tamamlayın

2. **API Anahtarlarını Alın**
   - iyzico Dashboard'a giriş yapın
   - Ayarlar > API & Güvenlik bölümüne gidin
   - API Key ve Secret Key'i kopyalayın
   - Test ortamı için Sandbox anahtarlarını kullanın

3. **Webhook URL'ini Ayarlayın** (Opsiyonel)
   - Ayarlar > Webhook bölümüne gidin
   - Callback URL: `https://yourdomain.com/api/payments/callback`
   - POST metodunu seçin

## Veritabanı Kurulumu

Aşağıdaki SQL script'ini Supabase SQL Editor'de çalıştırın:

\`\`\`bash
# Script'i çalıştır
npm run db:migrate
# veya manuel olarak:
# scripts/012_create_payment_tables.sql dosyasını Supabase'de çalıştırın
\`\`\`

Bu script şunları oluşturur:
- `payment_transactions` tablosu - Ödeme kayıtları
- `trial_periods` tablosu - Deneme süresi takibi
- Gerekli RLS politikaları
- Yardımcı fonksiyonlar

## Özellikler

### 1. 7 Günlük Ücretsiz Deneme
- Yeni kullanıcılar otomatik olarak 7 günlük deneme süresi alır
- Deneme süresi sonunda otomatik ücretlendirme yapılmaz
- Kullanıcılar deneme süresince tüm özelliklere erişebilir

### 2. Abonelik Paketleri
- **Temel (Ücretsiz)**: 1 WhatsApp Bot
- **Premium (₺29.99/ay)**: 3 WhatsApp Bot
- **Profesyonel (₺59.99/ay)**: 5 WhatsApp Bot

### 3. Ödeme Akışı
1. Kullanıcı paket seçer
2. Checkout sayfasına yönlendirilir
3. iyzico ödeme sayfası açılır
4. Ödeme tamamlanır
5. Callback ile abonelik aktif edilir
6. Başarı/hata sayfasına yönlendirilir

### 4. Otomatik Abonelik Yönetimi
- Günlük cron job ile süresi dolan abonelikler kontrol edilir
- Süresi dolan abonelikler otomatik olarak "expired" durumuna geçer
- Kullanıcılar aboneliklerini iptal edebilir
- İptal edilen abonelikler dönem sonuna kadar aktif kalır

## API Endpoints

### Ödeme İşlemleri
- `POST /api/payments/create-checkout` - Ödeme başlat
- `POST /api/payments/callback` - iyzico callback handler

### Abonelik Yönetimi
- `GET /api/user/subscription-status` - Abonelik durumu
- `GET /api/user/subscription-details` - Detaylı abonelik bilgisi
- `GET /api/user/payment-history` - Ödeme geçmişi
- `POST /api/user/cancel-subscription` - Abonelik iptali

### Deneme Süresi
- `POST /api/auth/initialize-trial` - Deneme süresi başlat
- `GET /api/user/check-access` - Erişim kontrolü

### Cron Jobs
- `GET /api/cron/check-subscriptions` - Günlük abonelik kontrolü

## Güvenlik

### RLS (Row Level Security)
Tüm tablolar RLS ile korunmaktadır:
- Kullanıcılar sadece kendi kayıtlarını görebilir
- Admin kullanıcılar tüm kayıtlara erişebilir
- Ödeme bilgileri şifrelenir

### PCI DSS Uyumluluğu
- Kart bilgileri hiçbir zaman sistemde saklanmaz
- Tüm ödemeler iyzico üzerinden işlenir
- 256-bit SSL şifreleme kullanılır

## Test Kartları (Sandbox)

iyzico sandbox ortamında test için kullanabileceğiniz kartlar:

\`\`\`
Başarılı Ödeme:
Kart No: 5528790000000008
Son Kullanma: 12/30
CVV: 123

Başarısız Ödeme:
Kart No: 5406670000000009
Son Kullanma: 12/30
CVV: 123
\`\`\`

## Production'a Geçiş

1. iyzico hesabınızı production'a geçirin
2. Production API anahtarlarını alın
3. Environment variable'ları güncelleyin:
   \`\`\`bash
   IYZICO_BASE_URL=https://api.iyzipay.com
   IYZICO_API_KEY=production_api_key
   IYZICO_SECRET_KEY=production_secret_key
   \`\`\`
4. Webhook URL'ini production domain ile güncelleyin
5. Test ödemeleri yaparak doğrulayın

## Vercel Cron Job Kurulumu

`vercel.json` dosyası zaten yapılandırılmıştır. Vercel'de otomatik olarak çalışacaktır.

Cron job her gün gece yarısı çalışır ve:
- Süresi dolan abonelikleri kontrol eder
- Expired durumuna geçirir
- Kullanıcılara bildirim gönderir (opsiyonel)

## Sorun Giderme

### Ödeme başlatılamıyor
- API anahtarlarını kontrol edin
- NEXT_PUBLIC_SITE_URL doğru mu?
- iyzico sandbox/production ayarı doğru mu?

### Callback çalışmıyor
- Webhook URL'i doğru mu?
- SSL sertifikası geçerli mi?
- Firewall kuralları callback'i engelliyor mu?

### Abonelik aktif olmuyor
- Veritabanı bağlantısını kontrol edin
- RLS politikalarını kontrol edin
- Supabase loglarını inceleyin

## Destek

Sorunlarınız için:
1. iyzico Dokümantasyonu: https://dev.iyzipay.com
2. iyzico Destek: destek@iyzico.com
3. Platform Destek: support@yourdomain.com
