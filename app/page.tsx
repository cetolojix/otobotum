import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { MessageSquare, Bot, Zap, Shield, Users, Clock, HelpCircle } from "lucide-react"

export const metadata = {
  title: "WhatsApp Yapay Zeka Otomasyonu - Akıllı Mesajlaşma Platformu",
  description:
    "Gelecek nesil yapay zeka teknolojisi ile WhatsApp otomasyonunu yeniden tanımlıyoruz. Sınırsız bot, 7/24 aktif sistem, yapay zeka destekli otomatik yanıtlar.",
  keywords: "whatsapp bot, yapay zeka otomasyon, ai chatbot, whatsapp business, otomatik mesaj, müşteri hizmetleri",
  openGraph: {
    title: "WhatsApp Yapay Zeka Otomasyonu - CetoBot",
    description:
      "Gelecek nesil yapay zeka teknolojisi ile WhatsApp otomasyonunu yeniden tanımlıyoruz. Sınırsız potansiyel, sıfır sınır.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com",
    type: "website",
  },
}

export const revalidate = 3600 // 1 hour

export default async function HomePage() {
  const supabase = await createClient()

  const [
    {
      data: { user },
      error,
    },
    profileData,
  ] = await Promise.all([supabase.auth.getUser(), supabase.from("profiles").select("role").limit(1).maybeSingle()])

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background digital-grid relative">
        <div className="circuit-pattern absolute inset-0 pointer-events-none" aria-hidden="true" />

        <Navigation />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
        >
          Ana içeriğe atla
        </a>

        <main id="main-content" className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
          <div
            className="absolute top-20 left-10 w-4 h-4 bg-neon-cyan rounded-full floating-element opacity-80 shadow-lg shadow-neon-cyan/50"
            aria-hidden="true"
          />
          <div
            className="absolute top-40 right-20 w-6 h-6 border-2 border-neon-purple rounded-full floating-element opacity-70 shadow-lg shadow-neon-purple/30"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-40 left-1/4 w-3 h-3 bg-tech-orange rounded-full floating-element opacity-80 shadow-lg shadow-tech-orange/50"
            aria-hidden="true"
          />

          <div className="text-center space-y-8 sm:space-y-12 max-w-5xl mx-auto">
            <div className="space-y-6 sm:space-y-8">
              <div className="relative">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tech-gradient text-balance leading-tight">
                  WhatsApp Yapay Zeka
                  <br />
                  <span className="neon-text">Otomasyonu</span>
                </h1>
                <div
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 sm:w-64 h-px data-stream"
                  aria-hidden="true"
                />
              </div>

              <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed px-4">
                Gelecek nesil yapay zeka teknolojisi ile WhatsApp otomasyonunu yeniden tanımlıyoruz.
                <span className="text-neon-cyan font-semibold"> Sınırsız potansiyel, sıfır sınır.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
              <a
                href="/auth/register"
                className="tech-button inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-white font-bold rounded-2xl text-base sm:text-lg relative z-10 shadow-2xl shadow-neon-blue/30"
              >
                <span className="relative z-10">Başlayın</span>
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 ml-3 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="/chat-test"
                className="hologram-card inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-foreground font-bold rounded-2xl text-base sm:text-lg hover:bg-secondary/30 transition-all duration-300 shadow-lg"
              >
                Sohbet Testi
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 sm:mt-24 max-w-5xl mx-auto px-4">
            <div className="hologram-card p-4 sm:p-8 rounded-2xl text-center relative shadow-lg">
              <div className="text-2xl sm:text-4xl font-bold neon-text mb-2 sm:mb-3">99.9%</div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Uptime
              </div>
            </div>
            <div className="hologram-card p-4 sm:p-8 rounded-2xl text-center relative shadow-lg">
              <div className="text-2xl sm:text-4xl font-bold text-neon-purple mb-2 sm:mb-3">∞</div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Sınırsız Bot
              </div>
            </div>
            <div className="hologram-card p-4 sm:p-8 rounded-2xl text-center relative shadow-lg">
              <div className="text-2xl sm:text-4xl font-bold text-tech-orange mb-2 sm:mb-3">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Aktif Sistem
              </div>
            </div>
            <div className="hologram-card p-4 sm:p-8 rounded-2xl text-center relative shadow-lg">
              <div className="text-2xl sm:text-4xl font-bold text-neon-cyan mb-2 sm:mb-3">YZ</div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Destekli
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-24 max-w-7xl mx-auto px-4">
            <div className="hologram-card p-6 sm:p-10 rounded-3xl text-center space-y-4 sm:space-y-6 relative group shadow-xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-neon-blue/40">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">WhatsApp Entegrasyonu</h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                QR kod ile saniyeler içinde WhatsApp hesabınızı bağlayın ve mesajlaşmaya başlayın. Kolay, hızlı ve
                güvenli.
              </p>
            </div>

            <div className="hologram-card p-6 sm:p-10 rounded-3xl text-center space-y-4 sm:space-y-6 relative group shadow-xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-neon-purple to-tech-orange rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-neon-purple/40">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Gelişmiş Yapay Zeka</h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                En son yapay zeka teknolojisi ile müşterilerinize anında, akıllı ve doğal yanıtlar verin.
              </p>
            </div>

            <div className="hologram-card p-6 sm:p-10 rounded-3xl text-center space-y-4 sm:space-y-6 relative group shadow-xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Uçtan Uca Şifreli</h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                Tüm WhatsApp konuşmalarınız uçtan uca şifreleme ile korunur. Mesajlarınız sadece size ve alıcıya
                özeldir.
              </p>
            </div>
          </div>

          <div className="mt-32 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-5xl font-bold tech-gradient text-balance">
                Güçlü Özellikler, <span className="neon-text">Sınırsız Potansiyel</span>
              </h2>
              <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
                WhatsApp Yapay Zeka Otomasyonu ile işletmenizi bir üst seviyeye taşıyın
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <div className="hologram-card p-8 rounded-3xl space-y-4 shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-blue/40">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Akıllı Yapay Zeka Asistanı</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gelişmiş yapay zeka teknolojisi ile müşterilerinize anında, doğal ve akıllı yanıtlar verin. 7/24
                  kesintisiz hizmet.
                </p>
              </div>

              <div className="hologram-card p-8 rounded-3xl space-y-4 shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-tech-orange rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-purple/40">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Çoklu Bot Yönetimi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Sınırsız WhatsApp botu oluşturun. Her bot için ayrı yapay zeka ayarları ve özel yanıt şablonları
                  tanımlayın.
                </p>
              </div>

              <div className="hologram-card p-8 rounded-3xl space-y-4 shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-cyan/40">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Gerçek Zamanlı Konuşma Takibi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tüm WhatsApp konuşmalarınızı tek bir panelden yönetin. Anlık bildirimler ve detaylı mesaj geçmişi.
                </p>
              </div>

              <div className="hologram-card p-8 rounded-3xl space-y-4 shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-tech-orange to-neon-blue rounded-2xl flex items-center justify-center shadow-2xl shadow-tech-orange/40">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Güvenli Altyapı</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Verileriniz en yüksek güvenlik standartlarıyla korunur. Uçtan uca şifreli konuşmalar, otomatik
                  yedekleme ve güvenli veri saklama.
                </p>
              </div>

              <div className="hologram-card p-8 rounded-3xl space-y-4 shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-purple/40">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Özelleştirilebilir Yanıtlar</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Her bot için özel yanıt şablonları oluşturun. Yapay zekayı işletmenize özel kişiselleştirin ve marka
                  sesinizi yansıtın.
                </p>
              </div>

              <div className="hologram-card p-8 rounded-3xl space-y-4 shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-cyan/40">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Hızlı Kurulum</h3>
                <p className="text-muted-foreground leading-relaxed">
                  WhatsApp hesabınızı QR kod okutarak saniyeler içinde bağlayın. Hiçbir teknik bilgi gerektirmez, anında
                  kullanıma hazır.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-32 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-5xl font-bold tech-gradient text-balance">
                Nasıl <span className="neon-text">Çalışır?</span>
              </h2>
              <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
                3 basit adımda WhatsApp otomasyonunuzu kurun
              </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-neon-blue/40">
                    1
                  </div>
                </div>
                <div className="hologram-card p-8 rounded-3xl flex-1 shadow-xl">
                  <h3 className="text-2xl font-bold text-foreground mb-4">WhatsApp Hesabınızı Bağlayın</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    QR kod ile saniyeler içinde WhatsApp hesabınızı platforma bağlayın. Hiçbir teknik bilgi gerektirmez.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-neon-purple to-tech-orange rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-neon-purple/40">
                    2
                  </div>
                </div>
                <div className="hologram-card p-8 rounded-3xl flex-1 shadow-xl">
                  <h3 className="text-2xl font-bold text-foreground mb-4">AI Ayarlarınızı Yapın</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Yapay zeka modelini seçin, özel promptlarınızı yazın. Botunuzu işletmenize özel kişiselleştirin.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-neon-cyan/40">
                    3
                  </div>
                </div>
                <div className="hologram-card p-8 rounded-3xl flex-1 shadow-xl">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Otomasyonun Keyfini Çıkarın</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Artık hazırsınız! AI botunuz müşterilerinize 7/24 yanıt vermeye başlasın. Siz işinize odaklanın.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-32 space-y-16 mb-20">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-5xl font-bold tech-gradient text-balance">
                Sıkça Sorulan <span className="neon-text">Sorular</span>
              </h2>
              <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
                Merak ettiklerinizin cevapları burada
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <div className="hologram-card p-8 rounded-3xl shadow-xl">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/30">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">WhatsApp hesabım güvende mi?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Evet, tamamen güvende. Resmi WhatsApp protokolü üzerinden güvenli bağlantı kuruyoruz. Tüm
                      konuşmalarınız uçtan uca şifreli olarak korunur ve hiçbir mesajınız üçüncü taraflarla
                      paylaşılmıyor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hologram-card p-8 rounded-3xl shadow-xl">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-tech-orange rounded-xl flex items-center justify-center shadow-lg shadow-neon-purple/30">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">Kaç tane WhatsApp botu oluşturabilirim?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Sınırsız! İstediğiniz kadar WhatsApp botu oluşturabilir, her biri için farklı yapay zeka ayarları
                      yapabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hologram-card p-8 rounded-3xl shadow-xl">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-cyan/30">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">Yapay zeka ne kadar hızlı yanıt veriyor?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yapay zeka sistemimiz saniyenin kesirleri içinde akıllı ve doğal yanıtlar üretir. Müşterileriniz
                      anında cevap alır.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hologram-card p-8 rounded-3xl shadow-xl">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-tech-orange to-neon-blue rounded-xl flex items-center justify-center shadow-lg shadow-tech-orange/30">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">Nasıl başlarım?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Çok basit! Kayıt olun, yeni bir bot oluşturun, QR kodu WhatsApp'tan okutun ve yapay zeka
                      ayarlarınızı yapın. 5 dakikada kullanıma hazır!
                    </p>
                  </div>
                </div>
              </div>

              <div className="hologram-card p-8 rounded-3xl shadow-xl">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-xl flex items-center justify-center shadow-lg shadow-neon-purple/30">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">
                      Yapay zeka yanıtlarını özelleştirebilir miyim?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Evet! Her bot için özel yanıt şablonları yazabilirsiniz. Yapay zekayı işletmenize özel
                      kişiselleştirin, marka sesinizi yansıtın ve istediğiniz tarzda yanıtlar alın.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hologram-card p-8 rounded-3xl shadow-xl">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-xl flex items-center justify-center shadow-lg shadow-neon-cyan/30">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">Konuşmaları nasıl yönetirim?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Konuşmalar panelinden tüm WhatsApp mesajlarınızı gerçek zamanlı olarak görüntüleyebilir, anlık
                      bildirimler alabilirsiniz. Tüm konuşma geçmişi güvenle saklanır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-20 sm:mt-32 space-y-6 sm:space-y-8 relative px-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-neon-cyan opacity-80"></div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold neon-text text-balance">Geleceğe Bağlan</h2>
            <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
              Yapay zeka destekli WhatsApp otomasyonunun sınırlarını keşfet.
              <span className="text-neon-cyan font-semibold"> Dijital dönüşümün öncüsü ol.</span>
            </p>
            <a
              href="/auth/register"
              className="tech-button inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-6 text-white font-bold rounded-2xl text-lg sm:text-xl relative z-10 group shadow-2xl shadow-neon-blue/40"
            >
              <span className="relative z-10">Başlayın</span>
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 ml-4 relative z-10 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          <div className="hologram-card p-4 sm:p-6 rounded-2xl mt-16 sm:mt-20 max-w-xl mx-auto text-center space-y-3 sm:space-y-4 shadow-lg">
            <div className="flex items-center justify-center space-x-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/40">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Güvenli Ödeme</h3>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <span className="text-green-400 font-semibold">256-bit SSL şifreleme</span> ile korunan ödemeler.
              <span className="text-neon-cyan font-semibold"> Iyzico</span> güvencesiyle güvenli alışveriş.
            </p>

            <div className="flex items-center justify-center space-x-4 sm:space-x-6 mt-3 sm:mt-4">
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-neon-cyan">Iyzico</div>
                <div className="text-xs text-muted-foreground">Güvenli Ödeme</div>
              </div>
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-green-400">SSL</div>
                <div className="text-xs text-muted-foreground">256-bit Şifreleme</div>
              </div>
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-tech-orange">3D</div>
                <div className="text-xs text-muted-foreground">Secure</div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  if (profileData?.role === "admin") {
    redirect("/admin")
  } else {
    redirect("/dashboard")
  }
}
