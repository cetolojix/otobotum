"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle2, XCircle, MessageSquare, Instagram, Send, Globe, Inbox } from "lucide-react"
import { InstagramSetupGuide } from "@/components/instagram-setup-guide"
import { TelegramSetupGuide } from "@/components/telegram-setup-guide"
import { WebchatSetupGuide } from "@/components/webchat-setup-guide"

interface ChatwootSettingsProps {
  instanceName: string
}

interface ConnectedChannel {
  channel: string
  inbox_id: number
  status: "connected" | "disconnected"
}

export function ChatwootSettings({ instanceName }: ChatwootSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [connectedChannels, setConnectedChannels] = useState<ConnectedChannel[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchConnectedChannels()
  }, [instanceName])

  const fetchConnectedChannels = async () => {
    try {
      const response = await fetch(`/api/chatwoot/inbox?instanceName=${instanceName}`)
      if (response.ok) {
        const data = await response.json()
        if (data.inbox) {
          setConnectedChannels([
            {
              channel: "WhatsApp",
              inbox_id: data.inbox.chatwoot_inbox_id,
              status: "connected",
            },
          ])
        }
      }
    } catch (err) {
      console.error("[v0] Failed to fetch channels:", err)
    }
  }

  const connectAllChannels = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const effectiveInstanceName = instanceName || "global"

      const response = await fetch("/api/chatwoot/connect-all-channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName: effectiveInstanceName }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Kanallar bağlanırken hata oluştu")
      }

      const data = await response.json()
      setSuccess(data.message)
      fetchConnectedChannels()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "WhatsApp":
        return <MessageSquare className="h-5 w-5" />
      case "Instagram":
        return <Instagram className="h-5 w-5" />
      case "Telegram":
        return <Send className="h-5 w-5" />
      case "Web Chat":
        return <Globe className="h-5 w-5" />
      default:
        return <Inbox className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="overview" className="gap-2">
            <Inbox className="h-4 w-4" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="instagram" className="gap-2">
            <Instagram className="h-4 w-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="telegram" className="gap-2">
            <Send className="h-4 w-4" />
            Telegram
          </TabsTrigger>
          <TabsTrigger value="webchat" className="gap-2">
            <Globe className="h-4 w-4" />
            Web Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="hologram-card border-0 bg-gradient-to-r from-blue-50/10 to-purple-50/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Çok Kanallı Mesajlaşma</CardTitle>
              <CardDescription className="text-base">
                WhatsApp, Instagram, Telegram ve Web Chat kanallarını tek tıkla Chatwoot'a bağlayın. Tüm mesajlarınız
                tek bir inbox'ta birleşir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {connectedChannels.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Bağlı Kanallar</h3>
                    <Badge variant="default" className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {connectedChannels.length} Kanal Aktif
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connectedChannels.map((channel) => (
                      <Card key={channel.channel} className="hologram-card">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getChannelIcon(channel.channel)}
                              <div>
                                <p className="font-medium">{channel.channel}</p>
                                <p className="text-sm text-muted-foreground">Inbox ID: {channel.inbox_id}</p>
                              </div>
                            </div>
                            <Badge variant="default">Bağlı</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert>
                    <Inbox className="h-4 w-4" />
                    <AlertDescription>
                      Tüm mesajlar Chatwoot'ta birleşiyor. AI Agent otomatik olarak tüm kanallardan gelen mesajlara
                      yanıt veriyor.
                    </AlertDescription>
                  </Alert>

                  <Button variant="outline" asChild>
                    <a href="https://chatwoot.cetoloji.com" target="_blank" rel="noopener noreferrer">
                      Chatwoot Dashboard'u Aç
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50">
                      <MessageSquare className="h-8 w-8 text-green-500" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50">
                      <Instagram className="h-8 w-8 text-pink-500" />
                      <span className="text-sm font-medium">Instagram</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50">
                      <Send className="h-8 w-8 text-blue-500" />
                      <span className="text-sm font-medium">Telegram</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50">
                      <Globe className="h-8 w-8 text-purple-500" />
                      <span className="text-sm font-medium">Web Chat</span>
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      Tek tıkla tüm kanalları bağlayın. Chatwoot otomatik olarak yapılandırılacak ve AI Agent tüm
                      kanallardan gelen mesajlara yanıt vermeye başlayacak.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={connectAllChannels} disabled={loading} size="lg" className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Tüm Kanalları Bağla
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hologram-card">
            <CardHeader>
              <CardTitle>Nasıl Çalışır?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Kanalları Bağlayın</p>
                    <p className="text-sm text-muted-foreground">
                      Tek tıkla WhatsApp, Instagram, Telegram ve Web Chat kanallarını Chatwoot'a bağlayın
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Mesajlar Birleşir</p>
                    <p className="text-sm text-muted-foreground">
                      Tüm kanallardan gelen mesajlar Chatwoot'ta tek bir inbox'ta toplanır
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">AI Otomatik Yanıt Verir</p>
                    <p className="text-sm text-muted-foreground">
                      Girdiğiniz prompt'a göre AI Agent tüm kanallardan gelen mesajlara otomatik yanıt verir
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instagram" className="space-y-6">
          <InstagramSetupGuide instanceName={instanceName} />
        </TabsContent>

        <TabsContent value="telegram" className="space-y-6">
          <TelegramSetupGuide instanceName={instanceName} />
        </TabsContent>

        <TabsContent value="webchat" className="space-y-6">
          <WebchatSetupGuide instanceName={instanceName} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
