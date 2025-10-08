"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Sheet, CheckCircle, AlertCircle, ExternalLink, Save } from "lucide-react"

interface GoogleSheetsConfig {
  id?: string
  spreadsheet_id: string
  sheet_name: string
  service_account_email?: string
  is_active: boolean
}

interface GoogleSheetsConfigProps {
  instanceName: string
}

export function GoogleSheetsConfig({ instanceName }: GoogleSheetsConfigProps) {
  const [config, setConfig] = useState<GoogleSheetsConfig>({
    spreadsheet_id: "",
    sheet_name: "Siparişler",
    service_account_email: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [hasExistingConfig, setHasExistingConfig] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [instanceName])

  const fetchConfig = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/google-sheets/config?instance=${encodeURIComponent(instanceName)}`)
      const data = await response.json()

      if (response.ok && data.config) {
        setConfig(data.config)
        setHasExistingConfig(true)
      }
    } catch (err) {
      console.error("[v0] Error fetching Google Sheets config:", err)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config.spreadsheet_id.trim()) {
      setError("Spreadsheet ID gereklidir")
      return
    }

    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/google-sheets/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName,
          ...config,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Ayarlar kaydedilemedi")
      }

      setSuccess(true)
      setHasExistingConfig(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ayarlar kaydedilemedi"
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    if (!config.spreadsheet_id.trim()) {
      setError("Önce Spreadsheet ID girin")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/google-sheets/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spreadsheet_id: config.spreadsheet_id,
          sheet_name: config.sheet_name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Bağlantı testi başarısız")
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Bağlantı testi başarısız"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="hologram-card border-0 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sheet className="h-5 w-5 text-green-600" />
          Google Sheets Entegrasyonu
        </CardTitle>
        <CardDescription>
          Müşteri siparişlerini otomatik olarak Google Sheets'e kaydedin
          {hasExistingConfig && (
            <Badge variant="default" className="ml-2 bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Aktif
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Google Sheets ayarları başarıyla kaydedildi!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spreadsheet-id">
              Spreadsheet ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="spreadsheet-id"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              value={config.spreadsheet_id}
              onChange={(e) => setConfig({ ...config, spreadsheet_id: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Google Sheets URL'inizden Spreadsheet ID'yi kopyalayın
              <br />
              Örnek: https://docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sheet-name">Sheet Adı</Label>
            <Input
              id="sheet-name"
              placeholder="Siparişler"
              value={config.sheet_name}
              onChange={(e) => setConfig({ ...config, sheet_name: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Siparişlerin kaydedileceği sheet'in adı (varsayılan: Siparişler)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-account">Service Account Email (Opsiyonel)</Label>
            <Input
              id="service-account"
              type="email"
              placeholder="your-service-account@project.iam.gserviceaccount.com"
              value={config.service_account_email || ""}
              onChange={(e) => setConfig({ ...config, service_account_email: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Google Cloud Service Account email adresi (gelişmiş kullanım için)
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveConfig} disabled={saving || loading} className="flex-1">
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Ayarları Kaydet
                </>
              )}
            </Button>
            <Button onClick={testConnection} disabled={loading || saving} variant="outline">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Bağlantıyı Test Et
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Kurulum Adımları
          </h4>
          <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
            <li>Google Sheets'te yeni bir spreadsheet oluşturun</li>
            <li>Spreadsheet URL'inden ID'yi kopyalayın</li>
            <li>Sheet'inize şu kolonları ekleyin: Tarih, Telefon, Müşteri Adı, Sipariş Detayı, Tutar</li>
            <li>Spreadsheet'i "Herkese açık" veya service account ile paylaşın</li>
            <li>Yukarıdaki forma Spreadsheet ID'yi yapıştırın</li>
            <li>"Ayarları Kaydet" butonuna tıklayın</li>
          </ol>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Not:</strong> Yapay zeka agent'ınız müşteri siparişi aldığında, sipariş bilgileri otomatik olarak
            Google Sheets'e kaydedilecektir. Siparişlerin düzgün kaydedilmesi için sheet'inizde yukarıdaki kolonların
            bulunduğundan emin olun.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
