import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Gizlilik Politikası - Kişisel Veri Koruma",
  description:
    "CetoBot WhatsApp AI Otomasyon platformu gizlilik politikası. KVKK uyumlu kişisel veri işleme, saklama ve koruma politikalarımız hakkında detaylı bilgi.",
  keywords: "gizlilik politikası, kvkk, kişisel veri koruma, veri güvenliği, gizlilik, cetobot",
  openGraph: {
    title: "Gizlilik Politikası - CetoBot",
    description: "KVKK uyumlu kişisel veri işleme ve koruma politikalarımız hakkında detaylı bilgi.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/privacy`,
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-6 py-20 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tech-gradient text-balance leading-tight">
            Gizlilik Politikası
          </h1>
          <p className="text-lg text-muted-foreground">Son güncelleme: {new Date().toLocaleDateString("tr-TR")}</p>
        </div>

        <div className="space-y-12">
          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">1. Genel Bilgiler</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CetoBot WhatsApp Yapay Zeka Otomasyonu platformu olarak, kullanıcılarımızın gizliliğini korumak bizim için
              en önemli önceliktir. Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığı, kullanıldığı ve
              korunduğu hakkında bilgi vermektedir.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat uyarınca
              hazırlanmıştır.
            </p>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">2. Toplanan Veriler</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Kişisel Bilgiler:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Ad, soyad</li>
                  <li>E-posta adresi</li>
                  <li>Telefon numarası</li>
                  <li>Şirket bilgileri (isteğe bağlı)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Teknik Veriler:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>IP adresi</li>
                  <li>Tarayıcı bilgileri</li>
                  <li>Cihaz bilgileri</li>
                  <li>Kullanım istatistikleri</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">3. Verilerin Kullanım Amaçları</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Hizmet sunumu ve müşteri desteği</li>
              <li>Hesap yönetimi ve güvenlik</li>
              <li>Ödeme işlemleri ve faturalandırma</li>
              <li>Hizmet geliştirme ve analiz</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Pazarlama faaliyetleri (onay vermeniz halinde)</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">4. Veri Güvenliği</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri alıyoruz:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>256-bit SSL şifreleme</li>
              <li>Güvenli veri merkezleri</li>
              <li>Düzenli güvenlik denetimleri</li>
              <li>Erişim kontrolü ve yetkilendirme</li>
              <li>Veri yedekleme ve kurtarma sistemleri</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">5. Veri Paylaşımı</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Kişisel verilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Yasal zorunluluklar</li>
              <li>Hizmet sağlayıcıları (ödeme işlemcileri, bulut hizmetleri)</li>
              <li>Açık rızanızın bulunması</li>
              <li>Şirket birleşme/devir işlemleri</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">6. Haklarınız</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenen verileriniz hakkında bilgi talep etme</li>
              <li>Verilerin düzeltilmesini isteme</li>
              <li>Verilerin silinmesini talep etme</li>
              <li>İşleme itiraz etme</li>
              <li>Veri taşınabilirliği</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">7. Çerezler (Cookies)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanıyoruz. Çerez türleri:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Zorunlu çerezler (site işlevselliği)</li>
              <li>Analitik çerezler (kullanım istatistikleri)</li>
              <li>Pazarlama çerezleri (kişiselleştirilmiş reklamlar)</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">8. İletişim</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>E-posta:</strong> privacy@cetobot.com
              </p>
              <p>
                <strong>Adres:</strong> Hürriyet Mahallesi Birlik Sokak No:21, Bahçelievler, İstanbul
              </p>
              <p>
                <strong>Telefon:</strong> 05431135672
              </p>
              <p>
                <strong>Web:</strong> cetobot.com
              </p>
            </div>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">9. Politika Güncellemeleri</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler e-posta yoluyla bildirilecek ve
              web sitesinde yayınlanacaktır. Politikayı düzenli olarak gözden geçirmenizi öneririz.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/kvkk" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              KVKK Metni
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              Kullanım Şartları
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              Hakkımızda
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              İletişim
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
