"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MessageSquare, ExternalLink, CheckCircle2, Copy, Check } from "lucide-react"
import { useState } from "react"

interface WebChatSetupGuideProps {
  instanceName: string
}

export function WebChatSetupGuide({ instanceName }: WebChatSetupGuideProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const embedCode = ` Chatwoot Web Chat Widget 
<script>
  (function(d,t) {
    var BASE_URL="${process.env.NEXT_PUBLIC_CHATWOOT_URL || "https://app.chatwoot.com"}";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.chatwootSDK.run({
        websiteToken: 'YOUR_WEBSITE_TOKEN',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
</script>`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            <CardTitle>Web Chat Widget</CardTitle>
          </div>
          <CardDescription>
            Sitenize Chatwoot web chat widget'ı ekleyin. Tüm kanallardan gelen mesajlar tek inbox'ta birleşir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Chatwoot web chat widget'ı ücretsizdir ve tüm kanallarınızı (WhatsApp, Instagram, Telegram) tek yerden
              yönetmenizi sağlar.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Adım 1: Chatwoot'ta Website Channel Oluşturun</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Chatwoot dashboard'unuza gidin</li>
                <li>Settings → Inboxes → Add Inbox</li>
                <li>Website seçeneğini seçin</li>
                <li>Website adı ve domain girin</li>
                <li>Widget ayarlarını özelleştirin (renk, pozisyon, hoş geldin mesajı)</li>
                <li>Website token'ınızı kopyalayın</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Adım 2: Widget Kodunu Sitenize Ekleyin</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Embed Code</Label>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      <code>{embedCode}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(embedCode)}
                      className="absolute top-2 right-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    Bu kodu sitenizin <code>&lt;/body&gt;</code> tag'inden hemen önce ekleyin. Website token'ınızı
                    Chatwoot'tan alıp <code>YOUR_WEBSITE_TOKEN</code> yerine yazın.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Adım 3: Widget'ı Özelleştirin</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Chatwoot dashboard'unda widget ayarlarını özelleştirebilirsiniz:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Widget rengi ve tema</li>
                <li>Hoş geldin mesajı</li>
                <li>Widget pozisyonu (sağ/sol alt köşe)</li>
                <li>Önceden tanımlı yanıtlar</li>
                <li>Çalışma saatleri</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Adım 4: Test Edin</h4>
              <p className="text-sm text-muted-foreground">
                Sitenizi ziyaret edin ve sağ alt köşede chat widget'ını göreceksiniz. Bir mesaj gönderin ve Chatwoot
                inbox'ınızda görünmesini bekleyin.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a
                href={`${process.env.NEXT_PUBLIC_CHATWOOT_URL || "https://app.chatwoot.com"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chatwoot Dashboard
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://www.chatwoot.com/docs/product/channels/live-chat/create-website-channel"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unified Inbox Avantajları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Tüm kanallar (WhatsApp, Instagram, Telegram, Web) tek inbox'ta</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Müşteri geçmişi ve notlar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Takım işbirliği ve atama</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Otomatik yanıtlar ve chatbot</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Raporlama ve analitik</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { WebChatSetupGuide as WebchatSetupGuide }
