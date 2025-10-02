import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { RefundForm } from "@/components/refund-form"

export const metadata: Metadata = {
  title: "İade Talebi - Ödeme İadesi",
  description:
    "CetoBot WhatsApp AI Otomasyon platformu ödeme iadesi talep formu. İade süreciniz hakkında bilgi alın ve talebinizi iletin.",
  keywords: "iade talebi, ödeme iadesi, para iadesi, iade süreci, müşteri hizmetleri",
  openGraph: {
    title: "İade Talebi - CetoBot",
    description: "Ödeme iadesi talep formu ve iade süreci hakkında bilgi.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/refund`,
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-5xl font-bold tech-gradient text-balance">
              İade <span className="neon-text">Talebi</span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed">
              Ödemeniz ile ilgili iade talebinde bulunmak için aşağıdaki formu doldurun
            </p>
          </div>

          <div className="hologram-card p-8 sm:p-12 rounded-3xl shadow-xl">
            <RefundForm />
          </div>

          <div className="hologram-card p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-foreground">İade Süreci Hakkında</h2>
            <ul className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-neon-cyan text-xl mt-0.5">•</span>
                <span>İade talebiniz 24 saat içinde değerlendirilecektir</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-purple text-xl mt-0.5">•</span>
                <span>Onaylanan iadeler 5-10 iş günü içinde hesabınıza yansıyacaktır</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-cyan text-xl mt-0.5">•</span>
                <span>İade sürecinin her aşamasında e-posta ile bilgilendirileceksiniz</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-tech-orange text-xl mt-0.5">•</span>
                <span>
                  Sorularınız için{" "}
                  <a
                    href="mailto:destek@cetobot.com"
                    className="text-neon-cyan hover:text-neon-blue transition-colors font-semibold"
                  >
                    destek@cetobot.com
                  </a>{" "}
                  adresinden bize ulaşabilirsiniz
                </span>
              </li>
            </ul>
          </div>

          <div className="hologram-card p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-3">İletişim</h3>
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
