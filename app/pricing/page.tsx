import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function PricingPage() {
  const plans = [
    {
      name: "Basic",
      displayName: "Basic",
      price: "₺1.999",
      monthlyLimit: "1.000 kişi",
      whatsappAccounts: "1 hesap",
      color: "from-neon-blue to-neon-cyan",
      icon: "🟢",
      features: [
        "Aylık 1.000 kişi limiti",
        "1 WhatsApp hesabı",
        "Standart şablonlar",
        "Basit AI akışı (sık sorular, sipariş alımı)",
        "Google Sheet entegrasyonu (tek yönlü)",
      ],
      popular: false,
    },
    {
      name: "Plus",
      displayName: "Plus",
      price: "₺2.999",
      monthlyLimit: "2.500 kişi",
      whatsappAccounts: "2 hesap",
      color: "from-neon-cyan to-neon-blue",
      icon: "🔵",
      features: [
        "Aylık 2.500 kişi limiti",
        "2 WhatsApp hesabı",
        "Kısmi özelleştirme (flow düzenleme)",
        "Orta seviye AI (adres tamamlama, ürün önerisi)",
        "Google Sheet + Webhook entegrasyonu",
      ],
      popular: true,
    },
    {
      name: "Pro",
      displayName: "Pro",
      price: "₺3.999",
      monthlyLimit: "6.000 kişi",
      whatsappAccounts: "5 hesap",
      color: "from-neon-purple to-tech-orange",
      icon: "🟣",
      features: [
        "Aylık 6.000 kişi limiti",
        "5 WhatsApp hesabı",
        "Tam özelleştirme (flow + mesaj şablonları)",
        "Gelişmiş AI (niyet algılama, insan devralma, çok dilli)",
        "API + Mail + CAPI entegrasyonu",
      ],
      popular: false,
    },
    {
      name: "Custom",
      displayName: "Görüşmeli (Custom)",
      price: "Görüşme sonrası teklif",
      monthlyLimit: "Sınırsız",
      whatsappAccounts: "Sınırsız",
      color: "from-tech-orange to-neon-purple",
      icon: "🟠",
      features: [
        "Sınırsız kişi limiti",
        "Sınırsız WhatsApp hesabı",
        "Tamamen ihtiyaca göre özelleştirme",
        "Özel AI modeli + özel akışlar",
        "ERP, CRM, e-ticaret sistemleriyle entegre",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <Navigation />

      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center space-y-8 mb-20">
          <h1 className="text-5xl md:text-7xl font-bold tech-gradient text-balance leading-tight">Fiyat Planları</h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
            İhtiyacınıza uygun planı seçin ve WhatsApp otomasyonunun gücünü keşfedin.
            <span className="text-neon-cyan font-semibold"> Güvenli ödeme altyapısı ile.</span>
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex justify-center mb-16">
          <div className="hologram-card px-8 py-4 rounded-2xl flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-tech-green to-neon-cyan rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <div className="font-bold text-foreground">256-bit SSL Güvenlik</div>
              <div className="text-xs text-muted-foreground">Iyzico güvenli ödeme altyapısı</div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`hologram-card p-8 rounded-3xl relative group shadow-xl ${
                plan.popular ? "ring-2 ring-neon-cyan shadow-neon-cyan/30" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-neon-cyan to-neon-blue px-6 py-2 rounded-full text-sm font-bold text-white shadow-lg">
                    En Popüler
                  </div>
                </div>
              )}

              <div className="text-center space-y-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-xl`}
                >
                  {plan.icon}
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.displayName}</h3>
                  <div className="text-4xl font-bold neon-text mb-4">{plan.price}</div>
                  {plan.name !== "Custom" && <div className="text-sm text-muted-foreground">/ aylık</div>}
                </div>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-neon-cyan mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === "Custom" ? "/contact" : "/auth/register"}
                  className={`tech-button w-full inline-flex items-center justify-center px-6 py-4 text-white font-bold rounded-2xl transition-all duration-300 group-hover:shadow-2xl ${
                    plan.popular ? "shadow-neon-cyan/40" : "shadow-neon-blue/30"
                  }`}
                >
                  {plan.name === "Custom" ? "İletişime Geç" : "Başlayın"}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="text-center mt-20 space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Güvenli Ödeme Yöntemleri</h2>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
            <div className="hologram-card px-6 py-3 rounded-xl">
              <span className="font-bold text-foreground">Kredi Kartı</span>
            </div>
            <div className="hologram-card px-6 py-3 rounded-xl">
              <span className="font-bold text-foreground">Banka Kartı</span>
            </div>
            <div className="hologram-card px-6 py-3 rounded-xl">
              <span className="font-bold text-foreground">Havale/EFT</span>
            </div>
          </div>

          {/* Payment Provider Logo Band */}
          <div className="flex justify-center items-center mt-8">
            <div className="hologram-card px-8 py-6 rounded-2xl">
              <img
                src="/images/payment-logos.png"
                alt="Iyzico ile Öde, Mastercard, Visa, American Express, Troy"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
          </div>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tüm ödemeleriniz Iyzico güvenli ödeme altyapısı ile 256-bit SSL şifreleme ile korunmaktadır. Kart
            bilgileriniz hiçbir zaman sistemimizde saklanmaz.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-32 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold neon-text text-center mb-16">Sıkça Sorulan Sorular</h2>
          <div className="space-y-6">
            <div className="hologram-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-foreground mb-3">Ödeme güvenli mi?</h3>
              <p className="text-muted-foreground">
                Evet, tüm ödemeler Iyzico güvenli ödeme altyapısı üzerinden gerçekleştirilir. 256-bit SSL şifreleme ile
                korunur ve PCI DSS standartlarına uygun olarak işlenir.
              </p>
            </div>
            <div className="hologram-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-foreground mb-3">Plan değişikliği yapabilir miyim?</h3>
              <p className="text-muted-foreground">
                Evet, istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. Değişiklik bir sonraki fatura
                döneminde geçerli olur.
              </p>
            </div>
            <div className="hologram-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-foreground mb-3">İptal etmek istersem ne olur?</h3>
              <p className="text-muted-foreground">
                Aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal işlemi sonrası mevcut dönem sonuna kadar
                hizmet almaya devam edersiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
