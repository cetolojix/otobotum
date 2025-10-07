# Environment Variables Kurulum Rehberi

Bu dosya, projenizin çalışması için gerekli tüm environment variable'ları açıklar.

## Kurulum Adımları

1. `.env.example` dosyasını `.env.local` olarak kopyalayın
2. Aşağıdaki rehberi takip ederek her bir değeri doldurun

## Değişken Açıklamaları

### 📦 PostgreSQL / Supabase Database

- **POSTGRES_URL**: Ana PostgreSQL bağlantı URL'i
- **POSTGRES_PRISMA_URL**: Prisma ORM için özel bağlantı URL'i (pgbouncer ile)
- **POSTGRES_URL_NON_POOLING**: Connection pooling olmayan direkt bağlantı
- **POSTGRES_HOST**: Veritabanı host adresi
- **POSTGRES_USER**: Veritabanı kullanıcı adı (genellikle "postgres")
- **POSTGRES_PASSWORD**: Veritabanı şifresi
- **POSTGRES_DATABASE**: Veritabanı adı (genellikle "postgres")

**Nereden alınır?** Supabase Dashboard → Project Settings → Database

### 🔐 Supabase Configuration

- **SUPABASE_URL**: Supabase proje URL'i (server-side)
- **NEXT_PUBLIC_SUPABASE_URL**: Supabase proje URL'i (client-side)
- **SUPABASE_ANON_KEY**: Public/Anonymous API key
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public API key (client-side)
- **SUPABASE_SERVICE_ROLE_KEY**: Admin yetkili service role key (GİZLİ!)
- **SUPABASE_JWT_SECRET**: JWT token doğrulama için secret

**Nereden alınır?** Supabase Dashboard → Project Settings → API

### 🤖 AI Configuration (Groq)

- **GROQ_API_KEY**: Groq AI API anahtarı

**Nereden alınır?** https://console.groq.com/keys

### 💬 WhatsApp (Evolution API)

- **EVOLUTION_API_URL**: Evolution API base URL'i
- **EVOLUTION_API_KEY**: Evolution API authentication key

**Nereden alınır?** Kendi Evolution API sunucunuzdan veya servis sağlayıcınızdan

### 📱 Facebook / Instagram / Messenger

- **FACEBOOK_APP_ID**: Facebook uygulama ID'si
- **FACEBOOK_APP_SECRET**: Facebook uygulama secret key (GİZLİ!)
- **NEXT_PUBLIC_FACEBOOK_APP_ID**: Facebook app ID (client-side)
- **INSTAGRAM_VERIFY_TOKEN**: Instagram webhook doğrulama token'ı
- **MESSENGER_VERIFY_TOKEN**: Messenger webhook doğrulama token'ı

**Nereden alınır?** https://developers.facebook.com/apps

### 💳 Payment Gateway (Iyzico)

- **IYZICO_API_KEY**: Iyzico API anahtarı
- **IYZICO_SECRET_KEY**: Iyzico secret key (GİZLİ!)
- **IYZICO_BASE_URL**: API endpoint (sandbox veya production)
  - Sandbox: `https://sandbox-api.iyzipay.com`
  - Production: `https://api.iyzipay.com`

**Nereden alınır?** https://merchant.iyzipay.com/

### ⚙️ Application Configuration

- **NEXT_PUBLIC_SITE_URL**: Uygulamanızın public URL'i
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`
- **CRON_SECRET**: Cron job'ları güvenli hale getirmek için rastgele token

## Güvenlik Notları

⚠️ **ÖNEMLİ:**
- `.env.local` dosyasını asla Git'e commit etmeyin
- `SUPABASE_SERVICE_ROLE_KEY` ve diğer secret key'leri asla client-side kodda kullanmayın
- Production ortamında mutlaka güçlü, rastgele değerler kullanın
- API key'lerinizi düzenli olarak rotate edin

## Vercel Deployment

Vercel'e deploy ederken:
1. Vercel Dashboard → Project Settings → Environment Variables
2. Tüm değişkenleri buraya ekleyin
3. `NEXT_PUBLIC_*` değişkenleri hem Production hem Preview hem Development için ekleyin
4. Diğer değişkenler sadece Production ve Preview için yeterli

## Sorun Giderme

**"Missing environment variables" hatası alıyorsanız:**
1. `.env.local` dosyasının proje root dizininde olduğundan emin olun
2. Next.js development server'ı yeniden başlatın (`npm run dev`)
3. Değişken isimlerinin tam olarak eşleştiğinden emin olun (büyük/küçük harf duyarlı)

**Supabase bağlantı hatası:**
- URL'lerin sonunda `/` olmadığından emin olun
- API key'lerin doğru kopyalandığından emin olun (boşluk vs. olmamalı)

**Evolution API bağlanamıyor:**
- API URL'inin `https://` ile başladığından emin olun
- API key'in geçerli olduğunu test edin
