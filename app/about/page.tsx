import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 sm:space-y-8 mb-16 sm:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tech-gradient text-balance leading-tight">
            Hakkımızda
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
            WhatsApp otomasyonunda yenilikçi çözümler sunan teknoloji şirketi.
            <span className="text-neon-cyan font-semibold"> Geleceği bugün yaşatıyoruz.</span>
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 mb-16 sm:mb-20">
          <div className="hologram-card p-6 sm:p-10 rounded-3xl space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold neon-text text-center">Misyonumuz</h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-center">
              İşletmelerin WhatsApp üzerinden müşteri iletişimini otomatikleştirerek, daha verimli ve etkili bir
              iletişim deneyimi sunmak. Yapay zeka teknolojisi ile insan benzeri etkileşimler yaratarak, müşteri
              memnuniyetini en üst seviyeye çıkarmak.
            </p>
          </div>

          <div className="hologram-card p-6 sm:p-10 rounded-3xl space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-neon-purple to-tech-orange rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold neon-text text-center">Vizyonumuz</h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-center">
              WhatsApp otomasyon alanında Türkiye'nin lider platformu olmak ve global pazarda tanınan bir marka haline
              gelmek. İnovasyon ve teknoloji ile sınırları zorlamaya devam ederek, dijital dönüşümün öncüsü olmak.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold neon-text text-center mb-12 sm:mb-16">Değerlerimiz</h2>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="hologram-card p-6 sm:p-8 rounded-2xl text-center space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-tech-green to-neon-cyan rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Güvenilirlik</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Müşterilerimizin verilerini en yüksek güvenlik standartlarıyla koruyoruz.
              </p>
            </div>

            <div className="hologram-card p-6 sm:p-8 rounded-2xl text-center space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">İnovasyon</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Sürekli gelişim ve yenilikçi çözümlerle sektörde öncü olmaya devam ediyoruz.
              </p>
            </div>

            <div className="hologram-card p-6 sm:p-8 rounded-2xl text-center space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-tech-orange to-neon-cyan rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Müşteri Odaklılık</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Müşteri memnuniyeti bizim için en önemli başarı kriteri.
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold neon-text text-center mb-12 sm:mb-16">Ekibimiz</h2>
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-8">
              Deneyimli yazılım geliştiricileri, AI uzmanları ve müşteri deneyimi profesyonellerinden oluşan ekibimiz,
              size en iyi hizmeti sunmak için çalışıyor.
            </p>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <div className="hologram-card p-4 sm:p-6 rounded-2xl">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-full mx-auto mb-4"></div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">Teknoloji Ekibi</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  AI ve otomasyon konularında uzman geliştiriciler
                </p>
              </div>
              <div className="hologram-card p-4 sm:p-6 rounded-2xl">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-neon-purple to-tech-orange rounded-full mx-auto mb-4"></div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">Destek Ekibi</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">7/24 müşteri desteği ve teknik yardım</p>
              </div>
              <div className="hologram-card p-4 sm:p-6 rounded-2xl">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-tech-green to-neon-cyan rounded-full mx-auto mb-4"></div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">Güvenlik Ekibi</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">Veri güvenliği ve sistem koruması uzmanları</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold neon-text">İletişime Geçin</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Sorularınız için bizimle iletişime geçebilir, demo talep edebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="tech-button inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-white font-bold rounded-2xl text-base sm:text-lg shadow-2xl shadow-neon-blue/30"
            >
              Ücretsiz Deneyin
              <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="hologram-card inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-foreground font-bold rounded-2xl text-base sm:text-lg hover:bg-secondary/30 transition-all duration-300"
            >
              İletişim
              <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
