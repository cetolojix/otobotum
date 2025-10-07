-- Update packages with new pricing and features (in Turkish Lira)

-- Update Basic package
UPDATE packages
SET 
  display_name_tr = 'Basic',
  display_name_en = 'Basic',
  max_instances = 1,
  max_whatsapp_instances = 1,
  max_instagram_instances = 0,
  max_messenger_instances = 0,
  price_monthly = 1999,
  price_yearly = 19990,
  features = jsonb_build_object(
    'tr', jsonb_build_array(
      '1.000 kişi aylık limit',
      '1 WhatsApp hesabı',
      'Standart şablonlar',
      'Basit AI akışı (sık sorular, sipariş alımı)',
      'Google Sheet entegrasyonu (tek yönlü)'
    ),
    'en', jsonb_build_array(
      '1,000 monthly person limit',
      '1 WhatsApp account',
      'Standard templates',
      'Simple AI flow (FAQs, order taking)',
      'Google Sheet integration (one-way)'
    )
  ),
  is_active = true,
  updated_at = now()
WHERE name = 'basic';

-- Update Plus package (previously premium)
UPDATE packages
SET 
  name = 'plus',
  display_name_tr = 'Plus',
  display_name_en = 'Plus',
  max_instances = 2,
  max_whatsapp_instances = 2,
  max_instagram_instances = 0,
  max_messenger_instances = 0,
  price_monthly = 2999,
  price_yearly = 29990,
  features = jsonb_build_object(
    'tr', jsonb_build_array(
      '2.500 kişi aylık limit',
      '2 WhatsApp hesabı',
      'Kısmi özelleştirme (flow düzenleme)',
      'Orta seviye AI (adres tamamlama, ürün önerisi)',
      'Google Sheet + Webhook entegrasyonu'
    ),
    'en', jsonb_build_array(
      '2,500 monthly person limit',
      '2 WhatsApp accounts',
      'Partial customization (flow editing)',
      'Mid-level AI (address completion, product suggestions)',
      'Google Sheet + Webhook integration'
    )
  ),
  is_active = true,
  updated_at = now()
WHERE name = 'premium';

-- Update Pro package
UPDATE packages
SET 
  display_name_tr = 'Pro',
  display_name_en = 'Pro',
  max_instances = 5,
  max_whatsapp_instances = 5,
  max_instagram_instances = 0,
  max_messenger_instances = 0,
  price_monthly = 3999,
  price_yearly = 39990,
  features = jsonb_build_object(
    'tr', jsonb_build_array(
      '6.000 kişi aylık limit',
      '5 WhatsApp hesabı',
      'Tam özelleştirme (flow + mesaj şablonları)',
      'Gelişmiş AI (niyet algılama, insan devralma, çok dilli)',
      'API + Mail + CAPI entegrasyonu'
    ),
    'en', jsonb_build_array(
      '6,000 monthly person limit',
      '5 WhatsApp accounts',
      'Full customization (flow + message templates)',
      'Advanced AI (intent detection, human takeover, multilingual)',
      'API + Mail + CAPI integration'
    )
  ),
  is_active = true,
  updated_at = now()
WHERE name = 'pro';

-- Insert or update Custom package
INSERT INTO packages (
  name,
  display_name_tr,
  display_name_en,
  max_instances,
  max_whatsapp_instances,
  max_instagram_instances,
  max_messenger_instances,
  price_monthly,
  price_yearly,
  features,
  is_active
)
VALUES (
  'custom',
  'Görüşmeli (Custom)',
  'Custom (Contact Us)',
  999,
  999,
  999,
  999,
  0,
  0,
  jsonb_build_object(
    'tr', jsonb_build_array(
      'Sınırsız kişi',
      'Sınırsız WhatsApp hesabı',
      'Tamamen ihtiyaca göre özelleştirme',
      'Özel AI modeli + özel akışlar',
      'ERP, CRM, e-ticaret sistemleriyle entegrasyon',
      'Görüşme sonrası özel fiyat teklifi'
    ),
    'en', jsonb_build_array(
      'Unlimited contacts',
      'Unlimited WhatsApp accounts',
      'Fully customized to needs',
      'Custom AI model + custom flows',
      'ERP, CRM, e-commerce system integration',
      'Custom quote after consultation'
    )
  ),
  true
)
ON CONFLICT (name) 
DO UPDATE SET
  display_name_tr = EXCLUDED.display_name_tr,
  display_name_en = EXCLUDED.display_name_en,
  max_instances = EXCLUDED.max_instances,
  max_whatsapp_instances = EXCLUDED.max_whatsapp_instances,
  max_instagram_instances = EXCLUDED.max_instagram_instances,
  max_messenger_instances = EXCLUDED.max_messenger_instances,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = now();
