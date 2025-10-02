import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tech-gradient text-balance">İletişim</h1>
            <p className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto text-balance leading-relaxed">
              WhatsApp Yapay Zeka Otomasyonu hakkında sorularınız mı var?
              <span className="text-neon-cyan font-semibold"> Bizimle iletişime geçin!</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Form */}
            <div className="hologram-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Bize Yazın</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">E-posta</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300"
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Telefon</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300"
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Konu</label>
                  <select className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300">
                    <option>Genel Bilgi</option>
                    <option>Teknik Destek</option>
                    <option>Satış</option>
                    <option>Faturalama</option>
                    <option>Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mesaj</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Mesajınızı buraya yazın..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full tech-button py-4 text-white font-bold rounded-xl text-base sm:text-lg shadow-2xl shadow-neon-blue/30"
                >
                  Mesaj Gönder
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 sm:space-y-8">
              <div className="hologram-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">İletişim Bilgileri</h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/30">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">E-posta</h3>
                      <p className="text-muted-foreground">info@cetobot.com</p>
                      <p className="text-muted-foreground">destek@cetobot.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-purple to-tech-orange rounded-xl flex items-center justify-center shadow-lg shadow-neon-purple/30">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Telefon</h3>
                      <p className="text-muted-foreground">05431135672</p>
                      <p className="text-xs text-muted-foreground">Pazartesi - Cuma: 09:00 - 18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-cyan/30">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Web Sitesi</h3>
                      <a href="https://cetobot.com" className="text-neon-cyan hover:text-neon-blue transition-colors">
                        cetobot.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-tech-orange to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-tech-orange/30">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Adres</h3>
                      <p className="text-muted-foreground">Hürriyet Mahallesi Birlik Sokak No:21</p>
                      <p className="text-muted-foreground">Bahçelievler, İstanbul</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hologram-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Destek Saatleri</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pazartesi - Cuma</span>
                    <span className="text-foreground font-medium">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cumartesi</span>
                    <span className="text-foreground font-medium">10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pazar</span>
                    <span className="text-muted-foreground">Kapalı</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
