import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni - Kişisel Verilerin Korunması",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni. Kişisel verilerinizin işlenmesi, saklanması ve haklarınız hakkında bilgi.",
  keywords: "kvkk, kişisel verilerin korunması, aydınlatma metni, veri sorumlusu, kişisel veri hakları",
  openGraph: {
    title: "KVKK Aydınlatma Metni - CetoBot",
    description: "Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni ve veri sahibi hakları.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/kvkk`,
  },
}

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-6 py-20 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tech-gradient text-balance leading-tight">
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-lg text-muted-foreground">
            Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni
          </p>
        </div>

        <div className="space-y-12">
          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">Veri Sorumlusu</h2>
            <p className="text-muted-foreground leading-relaxed">
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, WhatsApp AI Automation Platform olarak
              kişisel verilerinizin veri sorumlusu sıfatıyla işlenmesine ilişkin aşağıdaki bilgileri paylaşıyoruz.
            </p>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">İşlenen Kişisel Veriler</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Kimlik Verileri:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Ad, soyad</li>
                  <li>T.C. kimlik numarası (gerekli durumlarda)</li>
                  <li>Doğum tarihi</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">İletişim Verileri:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>E-posta adresi</li>
                  <li>Telefon numarası</li>
                  <li>Adres bilgileri</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Müşteri İşlem Verileri:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Hesap bilgileri</li>
                  <li>İşlem geçmişi</li>
                  <li>Ödeme bilgileri</li>
                  <li>Hizmet kullanım verileri</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">Kişisel Verilerin İşlenme Amaçları</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Hizmet sözleşmesinin kurulması ve ifası</li>
              <li>Müşteri memnuniyeti ve hizmet kalitesinin artırılması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Bilgi güvenliğinin sağlanması</li>
              <li>Fatura ve tahsilat işlemlerinin yürütülmesi</li>
              <li>İstatistiksel analiz ve raporlama</li>
              <li>Pazarlama faaliyetlerinin yürütülmesi (onay vermeniz halinde)</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Sözleşmenin kurulması veya ifası için gerekli olması</li>
              <li>Kanuni yükümlülüğün yerine getirilmesi</li>
              <li>Meşru menfaatlerimizin bulunması</li>
              <li>Açık rızanızın bulunması</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">Kişisel Verilerin Aktarılması</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Kişisel verileriniz aşağıdaki durumlarda ve kişilere aktarılabilir:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Hizmet sağlayıcıları (bulut hizmetleri, ödeme işlemcileri)</li>
              <li>Yasal yükümlülükler çerçevesinde kamu kurum ve kuruluşları</li>
              <li>Denetim şirketleri</li>
              <li>Hukuki danışmanlar</li>
              <li>İş ortakları (açık rızanız dahilinde)</li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">Kişisel Veri Sahibinin Hakları</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
              <li>
                KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini
                isteme
              </li>
              <li>
                Düzeltme, silme ve yok etme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini
                isteme
              </li>
              <li>
                İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi
                aleyhine bir sonucun ortaya çıkmasına itiraz etme
              </li>
              <li>
                Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini
                talep etme
              </li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">Başvuru Yöntemleri</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Yazılı Başvuru:</h3>
                <p className="text-muted-foreground ml-4">
                  Hürriyet Mahallesi Birlik Sokak No:21, Bahçelievler, İstanbul adresine kimlik teyidi yapılabilir
                  belgelerle birlikte elden teslim edilebilir veya noter kanalıyla gönderilebilir.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Elektronik Başvuru:</h3>
                <p className="text-muted-foreground ml-4">
                  kvkk@cetobot.com e-posta adresine güvenli elektronik imza, mobil imza ile imzalanmış başvuru
                  gönderilebilir.
                </p>
              </div>
            </div>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">Başvuru Değerlendirme Süreci</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Başvurular en geç 30 gün içinde sonuçlandırılır</li>
              <li>Başvuru ücretsizdir, ancak işlem maliyeti talep edilebilir</li>
              <li>Başvuru sonucu yazılı veya elektronik ortamda bildirilir</li>
              <li>
                Olumsuz cevap halinde gerekçe belirtilir ve Kişisel Verileri Koruma Kurulu'na başvuru hakkı hatırlatılır
              </li>
            </ul>
          </section>

          <section className="hologram-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold neon-text mb-6">İletişim Bilgileri</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>Şirket:</strong> WhatsApp AI Automation Platform
              </p>
              <p>
                <strong>Web:</strong> cetobot.com
              </p>
              <p>
                <strong>Adres:</strong> Hürriyet Mahallesi Birlik Sokak No:21, Bahçelievler, İstanbul
              </p>
              <p>
                <strong>E-posta:</strong> kvkk@cetobot.com
              </p>
              <p>
                <strong>Telefon:</strong> 05431135672
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer Links */}
      <Footer />
    </div>
  )
}
