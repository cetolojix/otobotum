import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Kullanım Şartları - Hizmet Koşulları",
  description:
    "CetoBot WhatsApp AI Otomasyon platformu kullanım şartları, hizmet koşulları, kullanıcı yükümlülükleri ve yasaklı kullanımlar hakkında detaylı bilgi.",
  keywords: "kullanım şartları, hizmet koşulları, kullanıcı sözleşmesi, yasal şartlar, cetobot",
  openGraph: {
    title: "Kullanım Şartları - CetoBot",
    description: "WhatsApp AI Otomasyon platformu kullanım şartları ve hizmet koşulları.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/terms`,
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-6 py-20 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tech-gradient text-balance leading-tight">Kullanım Şartları</h1>
          <p className="text-lg text-muted-foreground">Son güncelleme: {new Date().toLocaleDateString("tr-TR")}</p>
        </div>

        <div className="space-y-12">
          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">1. Genel Hükümler</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Bu kullanım şartları, WhatsApp AI Automation Platform hizmetlerini kullanımınızı düzenler. Hizmetlerimizi
              kullanarak bu şartları kabul etmiş sayılırsınız.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Bu şartlar Türkiye Cumhuriyeti kanunlarına tabidir ve Türk mahkemelerinin yetkisi altındadır.
            </p>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">2. Hizmet Tanımı</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              WhatsApp AI Automation Platform aşağıdaki hizmetleri sunar:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>WhatsApp mesajlaşma otomasyonu</li>
              <li>AI destekli müşteri hizmetleri</li>
              <li>Çoklu hesap yönetimi</li>
              <li>Raporlama ve analitik</li>
              <li>API entegrasyonları</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">3. Kullanıcı Yükümlülükleri</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Hizmetlerimizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Doğru ve güncel bilgiler sağlamak</li>
              <li>Hesap güvenliğini korumak</li>
              <li>Spam veya istenmeyen mesaj göndermemek</li>
              <li>Telif hakkı ihlali yapmamak</li>
              <li>Yasalara ve WhatsApp kullanım şartlarına uymak</li>
              <li>Sistemi kötüye kullanmamak</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">4. Yasaklı Kullanımlar</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Aşağıdaki faaliyetler kesinlikle yasaktır:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Yasa dışı içerik paylaşımı</li>
              <li>Dolandırıcılık veya aldatıcı faaliyetler</li>
              <li>Nefret söylemi veya taciz</li>
              <li>Virüs veya zararlı yazılım dağıtımı</li>
              <li>Sistemin güvenliğini tehdit etme</li>
              <li>Başkalarının hesaplarını ele geçirme</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">5. Ödeme ve Faturalandırma</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ödeme Şartları:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Ödemeler aylık olarak peşin tahsil edilir</li>
                  <li>Tüm fiyatlar KDV dahildir</li>
                  <li>Ödeme Iyzico güvenli altyapısı ile yapılır</li>
                  <li>Otomatik yenileme varsayılan olarak aktiftir</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">İptal ve İade:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>İptal işlemi hesap panelinden yapılabilir</li>
                  <li>İptal sonrası mevcut dönem sonuna kadar hizmet devam eder</li>
                  <li>Kullanılmayan süre için iade yapılmaz</li>
                  <li>Teknik sorunlar durumunda iade değerlendirilebilir</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">6. Hizmet Seviyesi</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Uptime Garantisi:</h3>
                <p className="text-muted-foreground ml-4">
                  %99.9 uptime hedefliyoruz. Planlı bakımlar önceden duyurulur.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Destek:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>E-posta desteği: 24 saat içinde yanıt</li>
                  <li>Canlı destek: Çalışma saatleri içinde</li>
                  <li>Dokümantasyon ve rehberler</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">7. Sorumluluk Sınırlaması</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Hizmetlerimizi kullanırken aşağıdaki sınırlamalar geçerlidir:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>WhatsApp politika değişikliklerinden sorumlu değiliz</li>
              <li>Üçüncü taraf hizmet kesintilerinden sorumlu değiliz</li>
              <li>Kullanıcı hatalarından kaynaklanan zararlar kapsamımız dışındadır</li>
              <li>Maksimum sorumluluk tutarı aylık abonelik ücretiyle sınırlıdır</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">8. Fikri Mülkiyet</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Platform ve içeriği üzerindeki tüm haklar saklıdır:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Yazılım ve kaynak kodları telif hakkı koruması altındadır</li>
              <li>Marka ve logolar tescilli markalardır</li>
              <li>Kullanıcı içerikleri üzerinde sınırlı lisans hakkımız vardır</li>
              <li>İzinsiz kopyalama ve dağıtım yasaktır</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">9. Hesap Askıya Alma ve Sonlandırma</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Aşağıdaki durumlarda hesabınız askıya alınabilir veya sonlandırılabilir:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Kullanım şartlarının ihlali</li>
              <li>Ödeme gecikmesi (7 gün sonra)</li>
              <li>Yasadışı faaliyetler</li>
              <li>Sistem güvenliğini tehdit etme</li>
              <li>Spam veya kötüye kullanım</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">10. Değişiklikler</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bu kullanım şartları gerektiğinde güncellenebilir. Önemli değişiklikler e-posta yoluyla bildirilecek ve
              web sitesinde yayınlanacaktır. Değişiklikler yayınlandıktan 30 gün sonra yürürlüğe girer.
            </p>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">11. İletişim</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Kullanım şartları hakkında sorularınız için:</p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>E-posta:</strong> legal@cetobot.com
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
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/kvkk" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              KVKK Metni
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              Hakkımızda
            </Link>
            <a href="mailto:legal@cetobot.com" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              Hukuki İletişim
            </a>
          </div>
        </div>
      </div>
      {/* Footer component for consistency across all pages */}
      <Footer />
    </div>
  )
}
