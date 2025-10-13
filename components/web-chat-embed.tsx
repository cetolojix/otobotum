"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Code, Eye, Palette } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WebChatEmbedProps {
  instanceName: string
}

export function WebChatEmbed({ instanceName }: WebChatEmbedProps) {
  const [copied, setCopied] = useState(false)
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [position, setPosition] = useState<"right" | "left">("right")
  const [welcomeMessage, setWelcomeMessage] = useState("Merhaba! Size nasıl yardımcı olabilirim?")

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"

  const embedCode = ` WhatsApp AI Chat Widget 
<script>
  (function() {
    window.whatsappAIConfig = {
      instanceName: "${instanceName}",
      apiUrl: "${siteUrl}/api/public/chat/${instanceName}",
      primaryColor: "${primaryColor}",
      position: "${position}",
      welcomeMessage: "${welcomeMessage}"
    };
    var script = document.createElement('script');
    script.src = '${siteUrl}/chat-widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="hologram-card border-0 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold neon-text flex items-center gap-2">
          <Code className="h-6 w-6" />
          Web Chat Widget
        </CardTitle>
        <CardDescription className="text-base">
          Sitenize canlı destek chat widget'ı ekleyin. Müşterileriniz AI bot'unuzla doğrudan konuşabilir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="customize" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customize" className="gap-2">
              <Palette className="h-4 w-4" />
              Özelleştir
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code className="h-4 w-4" />
              Kod
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Önizleme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customize" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Ana Renk</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Pozisyon</Label>
                <div className="flex gap-2">
                  <Button
                    variant={position === "right" ? "default" : "outline"}
                    onClick={() => setPosition("right")}
                    className="flex-1"
                  >
                    Sağ Alt
                  </Button>
                  <Button
                    variant={position === "left" ? "default" : "outline"}
                    onClick={() => setPosition("left")}
                    className="flex-1"
                  >
                    Sol Alt
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Hoş Geldin Mesajı</Label>
                <Input
                  id="welcomeMessage"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Merhaba! Size nasıl yardımcı olabilirim?"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <Alert>
              <AlertDescription>
                Bu kodu sitenizin <code className="text-neon-cyan">&lt;head&gt;</code> veya{" "}
                <code className="text-neon-cyan">&lt;body&gt;</code> bölümüne ekleyin.
              </AlertDescription>
            </Alert>

            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{embedCode}</code>
              </pre>
              <Button onClick={handleCopy} size="sm" className="absolute top-2 right-2" variant="secondary">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Kopyala
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Kurulum Adımları:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Yukarıdaki kodu kopyalayın</li>
                <li>Sitenizin HTML dosyasını açın</li>
                <li>
                  Kodu <code>&lt;/body&gt;</code> etiketinden hemen önce yapıştırın
                </li>
                <li>Sayfayı kaydedin ve yayınlayın</li>
                <li>Chat widget sağ alt köşede görünecektir</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Alert>
              <AlertDescription>Widget önizlemesi. Gerçek sitenizde bu şekilde görünecektir.</AlertDescription>
            </Alert>

            <div className="border-2 border-dashed border-border rounded-lg p-8 min-h-[400px] relative bg-muted/20">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">Sitenizin içeriği burada olacak</p>
                <p className="text-sm">Chat widget sağ/sol alt köşede görünecek</p>
              </div>

              {/* Chat Widget Preview */}
              <div
                className={`fixed bottom-4 ${position === "right" ? "right-4" : "left-4"} z-50`}
                style={{ position: "absolute" }}
              >
                <div
                  className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: primaryColor }}
                >
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
