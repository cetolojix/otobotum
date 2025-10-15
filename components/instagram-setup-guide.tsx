"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Instagram, ExternalLink, CheckCircle2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface InstagramSetupGuideProps {
  instanceName: string
}

export function InstagramSetupGuide({ instanceName }: InstagramSetupGuideProps) {
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [instagramUsername, setInstagramUsername] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch("/api/instagram/status")
      if (response.ok) {
        const data = await response.json()
        setConnected(data.connected)
        setInstagramUsername(data.username)
      }
    } catch (error) {
      console.error("Failed to check Instagram connection:", error)
    }
  }

  const connectInstagram = () => {
    setLoading(true)
    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "697521646697871"
    const redirectUri = "https://chatwoot.cetoloji.com/instagram/callback"
    const scope = [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_content_publish",
      "instagram_business_manage_insights",
    ].join(",")

    const authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code&scope=${encodeURIComponent(scope)}`

    window.location.href = authUrl
  }

  const disconnectInstagram = async () => {
    if (!confirm("Instagram bağlantısını kaldırmak istediğinizden emin misiniz?")) return

    setLoading(true)
    try {
      const response = await fetch("/api/instagram/disconnect", {
        method: "POST",
      })

      if (response.ok) {
        setConnected(false)
        setInstagramUsername(null)
      }
    } catch (error) {
      console.error("Failed to disconnect Instagram:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            <CardTitle>Instagram Direct Messages</CardTitle>
          </div>
          <CardDescription>
            Instagram mesajlarını Chatwoot'ta yönetin. Tek tıkla Instagram hesabınızı bağlayın.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {connected ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Instagram hesabınız (@{instagramUsername}) başarıyla bağlandı. Tüm DM'ler Chatwoot inbox'ınıza gelecek.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>
                Instagram Business veya Creator hesabınızı bağlayın. Tüm Direct Messages otomatik olarak Chatwoot'a
                yönlendirilecek.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {connected ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Bağlı Hesap</p>
                  <p className="text-sm text-muted-foreground">@{instagramUsername}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={disconnectInstagram} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Bağlantıyı Kes
                </Button>
              </div>
            ) : (
              <Button onClick={connectInstagram} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yönlendiriliyor...
                  </>
                ) : (
                  <>
                    <Instagram className="mr-2 h-4 w-4" />
                    Instagram ile Bağlan
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Gereksinimler:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Instagram Business veya Creator hesabı</li>
              <li>Facebook Page'e bağlı Instagram hesabı</li>
              <li>Chatwoot hesabı</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer">
                Instagram Business Hesabı Nasıl Oluşturulur
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
