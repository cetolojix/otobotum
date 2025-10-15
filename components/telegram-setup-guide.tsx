"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, ExternalLink, CheckCircle2, Copy, Check } from "lucide-react"
import { useState } from "react"

interface TelegramSetupGuideProps {
  instanceName: string
}

export function TelegramSetupGuide({ instanceName }: TelegramSetupGuideProps) {
  const [copied, setCopied] = useState(false)
  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/api/chatwoot/telegram/webhook`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-500" />
            <CardTitle>Telegram Bot</CardTitle>
          </div>
          <CardDescription>
            Telegram mesajlarını Chatwoot'ta yönetin. Bot mesajları otomatik olarak Chatwoot inbox'ınıza gelir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Telegram bot oluşturmak için Telegram hesabınız olması yeterlidir. Ücretsizdir.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Adım 1: Telegram Bot Oluşturun</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Telegram'da{" "}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    @BotFather
                    <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  ile konuşun
                </li>
                <li>/newbot komutunu gönderin</li>
                <li>Bot'unuz için bir isim ve kullanıcı adı seçin</li>
                <li>BotFather size bir API token verecek (örn: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Adım 2: Webhook Yapılandırması</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(webhookUrl)}
                      className="shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    Webhook'u ayarlamak için şu URL'yi kullanın:
                    <br />
                    <code className="text-xs">
                      https://api.telegram.org/bot[YOUR_BOT_TOKEN]/setWebhook?url={webhookUrl}
                    </code>
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Adım 3: Chatwoot'ta Telegram Channel Ekleyin</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Chatwoot dashboard'unuza gidin</li>
                <li>Settings → Inboxes → Add Inbox</li>
                <li>Telegram seçeneğini seçin</li>
                <li>Bot token'ınızı girin</li>
                <li>Inbox oluşturun</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Adım 4: Test Edin</h4>
              <p className="text-sm text-muted-foreground">
                Telegram bot'unuza bir mesaj gönderin. Mesaj Chatwoot inbox'ınızda görünmelidir.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">
                BotFather
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gereksinimler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Telegram Hesabı</span>
              <Badge variant="secondary">Gerekli</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Telegram Bot Token</span>
              <Badge variant="secondary">Gerekli</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
