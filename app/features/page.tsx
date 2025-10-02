import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Özellikler - WhatsApp AI Otomasyon Özellikleri | CetoBot",
  description:
    "Çoklu WhatsApp yönetimi, akıllı mesaj otomasyonu, toplu mesaj gönderimi, detaylı raporlama ve daha fazlası. WhatsApp AI otomasyon platformunun tüm özelliklerini keşfedin.",
  keywords: [
    "whatsapp özellikleri",
    "toplu mesaj",
    "otomatik yanıt",
    "whatsapp yönetimi",
    "ai otomasyon",
    "mesaj şablonları",
    "whatsapp business",
    "chatbot",
  ],
  openGraph: {
    title: "WhatsApp AI Otomasyon Özellikleri - CetoBot",
    description:
      "Çoklu WhatsApp yönetimi, akıllı mesaj otomasyonu, toplu mesaj gönderimi ve detaylı raporlama özellikleri.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/features`,
    siteName: "CetoBot",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp AI Otomasyon Özellikleri - CetoBot",
    description: "Çoklu WhatsApp yönetimi, akıllı mesaj otomasyonu ve daha fazlası.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/features`,
  },
}

export const revalidate = 3600 // Revalidate every hour

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-neon-blue focus:text-white focus:rounded-lg"
      >
        Ana içeriğe atla
      </a>

      <Navigation />

      <main id="main-content" className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-6 sm:space-y-8 mb-16 sm:mb-20">
          <div className="relative">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tech-gradient text-balance leading-tight">
              Gerçek
              <br />
              <span className="neon-text">Özellikler</span>
            </h1>
            <div
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 sm:w-64 h-px data-stream"
              aria-hidden="true"
            ></div>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 max-w-4xl mx-auto text-balance leading-relaxed">
            WhatsApp Yapay Zeka Otomasyonunun gerçek gücünü keşfedin.
            <span className="text-neon-cyan font-semibold"> Her özellik, işinizi dönüştürmek için tasarlandı.</span>
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 mb-16 sm:mb-20">
          {/* Multi-Instance Management */}
          <article className="hologram-card p-8 sm:p-12 rounded-3xl space-y-6 sm:space-y-8 relative group shadow-2xl">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-blue/40"
                aria-hidden="true"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Çoklu WhatsApp Yönetimi</h2>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Birden fazla WhatsApp Business hesabını tek panelden yönetin. Her hesap bağımsız çalışır ve kendi
              otomasyonlarına sahiptir.
            </p>
            <ul className="space-y-3 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-cyan rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Sınırsız WhatsApp Business hesabı bağlantısı</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-cyan rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>QR kod ile kolay bağlantı kurma</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-cyan rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Gerçek zamanlı bağlantı durumu takibi</span>
              </li>
            </ul>
          </article>

          {/* AI-Powered Automation */}
          <article className="hologram-card p-8 sm:p-12 rounded-3xl space-y-6 sm:space-y-8 relative group shadow-2xl">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-neon-purple to-tech-orange rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-purple/40"
                aria-hidden="true"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Akıllı Mesaj Otomasyonu</h2>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Yapay zeka destekli otomatik yanıtlar, anahtar kelime bazlı tetikleyiciler ve akıllı müşteri
              segmentasyonu.
            </p>
            <ul className="space-y-3 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-tech-orange rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Anahtar kelime bazlı otomatik yanıtlar</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-tech-orange rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Müşteri etiketleme ve segmentasyon</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-tech-orange rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Koşullu mesaj akışları (chatbot)</span>
              </li>
            </ul>
          </article>

          {/* Message Broadcasting */}
          <article className="hologram-card p-8 sm:p-12 rounded-3xl space-y-6 sm:space-y-8 relative group shadow-2xl">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-cyan/40"
                aria-hidden="true"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Toplu Mesaj Gönderimi</h2>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Binlerce kişiye aynı anda mesaj gönderin. Kişiselleştirilmiş mesajlar ve zamanlı gönderim özellikleri.
            </p>
            <ul className="space-y-3 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-purple rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Excel/CSV dosyasından toplu mesaj</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-purple rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Kişiselleştirilmiş mesaj değişkenleri</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-purple rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Zamanlı mesaj gönderimi</span>
              </li>
            </ul>
          </article>

          {/* Analytics & Reporting */}
          <article className="hologram-card p-8 sm:p-12 rounded-3xl space-y-6 sm:space-y-8 relative group shadow-2xl">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-tech-orange to-neon-blue rounded-2xl flex items-center justify-center shadow-2xl shadow-tech-orange/40"
                aria-hidden="true"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Detaylı Raporlama</h2>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Mesaj istatistikleri, müşteri etkileşim raporları ve performans analizleri ile işinizi optimize edin.
            </p>
            <ul className="space-y-3 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-blue rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Mesaj teslim ve okunma raporları</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-blue rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Müşteri etkileşim analizleri</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-blue rounded-full flex-shrink-0" aria-hidden="true"></div>
                <span>Excel formatında rapor indirme</span>
              </li>
            </ul>
          </article>
        </div>

        {/* Additional Features */}
        <section className="space-y-12 sm:space-y-16">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold neon-text mb-4 sm:mb-6">Daha Fazla Özellik</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              İşinizi büyütmek için ihtiyacınız olan her şey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <article className="hologram-card p-6 sm:p-8 rounded-2xl text-center space-y-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-xl flex items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">Zamanlı Mesajlar</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Belirli tarihlerde otomatik mesaj gönderimi</p>
            </article>

            <article className="hologram-card p-6 sm:p-8 rounded-2xl text-center space-y-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-purple to-tech-orange rounded-xl flex items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">Kişi Yönetimi</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Müşteri listelerini organize etme ve etiketleme
              </p>
            </article>

            <article className="hologram-card p-6 sm:p-8 rounded-2xl text-center space-y-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-tech-orange to-neon-cyan rounded-xl flex items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">Mesaj Şablonları</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Özelleştirilebilir mesaj şablonları</p>
            </article>

            <article className="hologram-card p-6 sm:p-8 rounded-2xl text-center space-y-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-cyan to-tech-orange rounded-xl flex items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">Hızlı Yanıtlar</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Anında otomatik yanıt sistemi</p>
            </article>

            <article className="hologram-card p-6 sm:p-8 rounded-2xl text-center space-y-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-tech-orange to-neon-blue rounded-xl flex items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">Medya Gönderimi</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Resim, video ve dosya gönderimi</p>
            </article>

            <article className="hologram-card p-6 sm:p-8 rounded-2xl text-center space-y-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">Güvenli Altyapı</h3>
              <p className="text-muted-foreground text-sm sm:text-base">End-to-end şifreleme ve veri güvenliği</p>
            </article>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-20 sm:mt-32 space-y-6 sm:space-y-8 relative">
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-neon-cyan opacity-80"
            aria-hidden="true"
          ></div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold neon-text text-balance">Hemen Başlayın</h2>
          <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
            Tüm bu özellikleri deneyimlemek için hemen kaydolun.
            <span className="text-neon-cyan font-semibold"> 7 gün ücretsiz deneme.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <a
              href="/auth/register"
              className="tech-button inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-6 text-white font-bold rounded-2xl text-lg sm:text-xl relative z-10 group shadow-2xl shadow-neon-blue/40"
            >
              <span className="relative z-10">Ücretsiz Başlayın</span>
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 ml-4 relative z-10 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/pricing"
              className="hologram-card inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-6 text-foreground font-bold rounded-2xl text-lg sm:text-xl hover:bg-secondary/30 transition-all duration-300 shadow-lg"
            >
              Fiyatları Görüntüle
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
