import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DataDeletionForm } from "@/components/data-deletion-form"

export const metadata = {
  title: "Veri Silme Talebi - KVKK & GDPR",
  description:
    "KVKK ve GDPR kapsamında kişisel verilerinizin silinmesini talep edin. Veri silme hakkınızı kullanın ve hesabınızı kalıcı olarak silin.",
  keywords: "veri silme, kvkk, gdpr, kişisel veri silme, hesap silme, veri koruma",
  openGraph: {
    title: "Veri Silme Talebi - CetoBot",
    description: "KVKK ve GDPR kapsamında kişisel verilerinizin silinmesini talep edin.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/data-deletion`,
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-5xl font-bold tech-gradient text-balance">
              Veri Silme <span className="neon-text">Talep Formu</span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
              KVKK ve GDPR kapsamında kişisel verilerinizin silinmesini talep edebilirsiniz
            </p>
          </div>

          <div className="hologram-card p-8 sm:p-12 rounded-3xl shadow-xl space-y-6">
            <div className="space-y-4 text-muted-foreground">
              <h2 className="text-2xl font-bold text-foreground">Veri Silme Hakkınız</h2>
              <p className="leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR)
                kapsamında, kişisel verilerinizin silinmesini talep etme hakkına sahipsiniz.
              </p>
              <p className="leading-relaxed">
                Bu formu doldurarak platformumuzda kayıtlı olan tüm kişisel verilerinizin silinmesini talep
                edebilirsiniz. Talebiniz en geç 30 gün içerisinde değerlendirilecek ve sonuçlandırılacaktır.
              </p>

              <div className="bg-background/50 border border-border/50 rounded-xl p-6 space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Silinecek Veriler:</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Hesap bilgileriniz (ad, soyad, e-posta, telefon)</li>
                  <li>WhatsApp bot instance'larınız ve ayarları</li>
                  <li>Konuşma geçmişi ve mesaj kayıtları</li>
                  <li>Ödeme ve fatura bilgileriniz</li>
                  <li>Sistem logları ve kullanım verileri</li>
                </ul>
              </div>

              <div className="bg-tech-orange/10 border border-tech-orange/30 rounded-xl p-6 space-y-2">
                <h3 className="text-lg font-semibold text-tech-orange flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  Önemli Uyarı
                </h3>
                <p className="text-foreground/90 leading-relaxed">
                  Veri silme talebiniz onaylandıktan sonra bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak
                  silinecek ve hesabınıza erişiminiz sonlandırılacaktır.
                </p>
              </div>
            </div>

            <DataDeletionForm />
          </div>

          <div className="hologram-card p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-3">İletişim</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Veri silme talebiniz hakkında sorularınız varsa veya destek almak isterseniz bizimle iletişime
              geçebilirsiniz:
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="text-foreground font-semibold">E-posta:</span>{" "}
                <a href="mailto:destek@cetobot.com" className="text-neon-cyan hover:text-neon-blue transition-colors">
                  destek@cetobot.com
                </a>
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground font-semibold">Telefon:</span>{" "}
                <a href="tel:05431135672" className="text-neon-cyan hover:text-neon-blue transition-colors">
                  0543 113 56 72
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
