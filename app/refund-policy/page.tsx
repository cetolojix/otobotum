import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CheckCircle2, XCircle, Clock, Mail, Phone, ArrowLeft } from "lucide-react"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-blue transition-colors font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfaya Dön
            </Link>
            <div className="text-center space-y-4">
              <h1 className="text-3xl sm:text-5xl font-bold tech-gradient text-balance">
                İade ve İptal <span className="neon-text">Politikası</span>
              </h1>
              <p className="text-lg text-foreground/80">Son güncelleme: 1 Ocak 2025</p>
            </div>
          </div>

          <div className="hologram-card p-8 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Genel Bilgiler</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                CetoBot olarak müşteri memnuniyeti bizim için önceliklidir. Bu politika, hizmetlerimizle ilgili iade ve
                iptal işlemlerinin nasıl gerçekleştirileceğini açıklamaktadır.
              </p>
              <p>
                6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında
                haklarınızı kullanabilirsiniz.
              </p>
            </div>
          </div>

          <div className="hologram-card p-8 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-xl flex items-center justify-center shadow-lg shadow-neon-cyan/30">
                <Clock className="h-6 w-6 text-white" />
              </div>
              Cayma Hakkı Süresi
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Tüketiciler, hizmetin satın alındığı tarihten itibaren{" "}
                <strong className="text-neon-cyan">14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin
                ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
              </p>
              <p>Cayma hakkı süresi, hizmet sözleşmelerinde sözleşmenin kurulduğu gün başlar.</p>
            </div>
          </div>

          <div className="hologram-card p-8 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              İade Edilebilir Durumlar
            </h2>
            <ul className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Hizmet henüz kullanılmaya başlanmamışsa</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>14 günlük cayma hakkı süresi içinde talep edilmişse</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Teknik bir arıza nedeniyle hizmet verilemiyorsa</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Hizmet açıklamasında belirtilen özellikler sağlanamıyorsa</span>
              </li>
            </ul>
          </div>

          <div className="hologram-card p-8 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              İade Edilemez Durumlar
            </h2>
            <ul className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Hizmet ifasına başlanmış ve tamamlanmışsa</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>14 günlük cayma hakkı süresi geçmişse</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Kullanıcı hatası veya yanlış kullanım sonucu oluşan sorunlar</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Promosyon veya indirimli kampanyalardan alınan hizmetler (özel şartlar geçerlidir)</span>
              </li>
            </ul>
          </div>

          <div className="hologram-card p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-foreground">İade Prosedürü</h2>
            <p className="text-muted-foreground leading-relaxed">İade talebinizi nasıl oluşturabilirsiniz?</p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-neon-blue/30">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">İade Talebinde Bulunun</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    <Link
                      href="/refund"
                      className="text-neon-cyan hover:text-neon-blue transition-colors font-semibold"
                    >
                      İade talep formu
                    </Link>{" "}
                    üzerinden veya iletişim kanallarımız aracılığıyla talebinizi iletin.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-neon-purple to-tech-orange rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-neon-purple/30">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Değerlendirme</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Talebiniz 2-3 iş günü içinde değerlendirilir ve size geri dönüş yapılır.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-neon-cyan/30">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">İade İşlemi</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Onaylanan iade talepleri için ödeme, 14 iş günü içinde ödeme yönteminize iade edilir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hologram-card p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-foreground">İletişim</h2>
            <p className="text-muted-foreground leading-relaxed">
              İade ve iptal işlemleri için bizimle iletişime geçin
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-xl flex items-center justify-center shadow-lg shadow-neon-cyan/30">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <a
                  href="mailto:destek@cetobot.com"
                  className="text-lg text-neon-cyan hover:text-neon-blue transition-colors font-semibold"
                >
                  destek@cetobot.com
                </a>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-tech-orange rounded-xl flex items-center justify-center shadow-lg shadow-neon-purple/30">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <a
                  href="tel:05431135672"
                  className="text-lg text-neon-cyan hover:text-neon-blue transition-colors font-semibold"
                >
                  0543 113 56 72
                </a>
              </div>

              <div className="pt-4">
                <Link href="/refund">
                  <button className="tech-button w-full px-8 py-4 text-white font-bold rounded-2xl text-lg shadow-2xl shadow-neon-blue/30">
                    İade Talebinde Bulun
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="hologram-card p-6 rounded-2xl shadow-lg">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Bu politika, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili mevzuat çerçevesinde
              hazırlanmıştır. CetoBot, bu politikayı önceden haber vermeksizin güncelleme hakkını saklı tutar.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
