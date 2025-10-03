# Ödeme Sistemi Kullanım Kılavuzu

## Kullanıcı Akışı

### 1. Yeni Kullanıcı Kaydı
- Kullanıcı kayıt olur
- Otomatik olarak 7 günlük deneme süresi başlar
- Temel paket özellikleri aktif olur

### 2. Paket Seçimi
- `/subscription` sayfasından paketleri görüntüler
- Aylık veya yıllık faturalandırma seçer
- "Satın Al" butonuna tıklar

### 3. Checkout
- `/checkout` sayfasına yönlendirilir
- Sipariş özeti gösterilir
- "Güvenli Ödemeye Geç" butonuna tıklar
- iyzico ödeme sayfası açılır

### 4. Ödeme
- Kart bilgilerini girer
- Ödemeyi onaylar
- Callback ile geri döner

### 5. Sonuç
- Başarılı: `/payment/success` - Konfeti animasyonu
- Başarısız: `/payment/failed` - Hata mesajı ve tekrar deneme

### 6. Abonelik Yönetimi
- `/account/subscription` sayfasından:
  - Mevcut paketi görüntüler
  - Ödeme geçmişini inceler
  - Paketi yükseltir
  - Aboneliği iptal eder

## Admin İşlemleri

### Paket Yönetimi
Supabase Dashboard'dan `packages` tablosunu düzenleyin:
- Yeni paket ekleyin
- Fiyatları güncelleyin
- Özellikleri değiştirin

### Ödeme Takibi
`payment_transactions` tablosundan:
- Tüm ödemeleri görüntüleyin
- Başarısız ödemeleri inceleyin
- İade işlemlerini yönetin

### Abonelik Yönetimi
`user_subscriptions` tablosundan:
- Kullanıcı aboneliklerini görüntüleyin
- Manuel olarak abonelik uzatın
- Sorunlu abonelikleri düzeltin

## Önemli Notlar

1. **Deneme Süresi**: Her kullanıcı sadece bir kez deneme süresi alabilir
2. **Otomatik Yenileme**: Şu an manuel yenileme, gelecekte otomatik yenileme eklenebilir
3. **İptal**: İptal edilen abonelikler dönem sonuna kadar aktif kalır
4. **Geri Ödeme**: iyzico dashboard'dan manuel olarak yapılmalıdır

## Geliştirme Notları

### Yeni Paket Ekleme
1. Supabase'de `packages` tablosuna ekleyin
2. Özellikleri JSON array olarak ekleyin
3. Otomatik olarak UI'da görünür

### Fiyat Değişikliği
1. Mevcut abonelikler etkilenmez
2. Yeni abonelikler yeni fiyattan başlar
3. Kullanıcılara bildirim gönderin

### Özel İndirimler
`payment_transactions` tablosunda `amount` alanını düzenleyerek özel indirimler uygulayabilirsiniz.
