"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertCircle, Key } from "lucide-react"

interface SetupResult {
  package: string
  success?: boolean
  error?: string
  productReferenceCode?: string
}

export default function SetupIyzicoPage() {
  const [loading, setLoading] = useState(false)
  const [testingCredentials, setTestingCredentials] = useState(false)
  const [results, setResults] = useState<SetupResult[]>([])
  const [error, setError] = useState("")
  const [credentialTestResult, setCredentialTestResult] = useState<any>(null)

  const handleTestCredentials = async () => {
    setTestingCredentials(true)
    setCredentialTestResult(null)
    setError("")

    try {
      const response = await fetch("/api/iyzico/test-credentials")
      const data = await response.json()
      setCredentialTestResult(data)

      if (!data.success) {
        setError(data.message || "Credential test failed")
      }
    } catch (err) {
      setError(`Test failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setTestingCredentials(false)
    }
  }

  const handleSetup = async () => {
    setLoading(true)
    setError("")
    setResults([])

    try {
      console.log("[v0] Starting iyzico setup...")

      const response = await fetch("/api/iyzico/setup-products", {
        method: "POST",
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`API returned ${response.status}: ${text}`)
      }

      const data = await response.json()
      console.log("[v0] Setup response:", data)

      if (data.success) {
        setResults(data.results || [])
      } else {
        setError(data.error || "Setup failed")
      }
    } catch (err) {
      console.error("[v0] Setup error:", err)
      setError(`Connection error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>iyzico Abonelik Kurulumu</CardTitle>
          <CardDescription>
            Bu sayfa, tüm paketler için iyzico ürün ve fiyatlandırma planlarını oluşturur. Bu işlem sadece bir kez
            yapılmalıdır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
            </Alert>
          )}

          {credentialTestResult && (
            <Alert variant={credentialTestResult.success ? "default" : "destructive"}>
              <div className="flex items-start gap-3">
                {credentialTestResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{credentialTestResult.message}</div>
                  {credentialTestResult.troubleshooting && (
                    <div className="text-sm mt-2 space-y-1">
                      <div>API Key: {credentialTestResult.troubleshooting.apiKeyPrefix}</div>
                      <div>Base URL: {credentialTestResult.troubleshooting.baseUrl}</div>
                      {credentialTestResult.troubleshooting.errorMessage && (
                        <div className="text-red-600">Error: {credentialTestResult.troubleshooting.errorMessage}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="font-semibold">Kurulum Sonuçları:</div>
              {results.map((result, index) => (
                <Alert key={index} variant={result.success ? "default" : "destructive"}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{result.package}</div>
                      {result.success && result.productReferenceCode && (
                        <div className="text-sm text-muted-foreground">Product Code: {result.productReferenceCode}</div>
                      )}
                      {result.error && <div className="text-sm text-red-600">{result.error}</div>}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">Önemli Notlar:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Önce "Test iyzico Credentials" butonuna tıklayarak API anahtarlarınızı test edin</li>
                  <li>Bu işlem tüm paketler için iyzico ürün ve planları oluşturur</li>
                  <li>Zaten oluşturulmuş ürünler atlanır</li>
                  <li>İşlem birkaç saniye sürebilir</li>
                  <li>İşlem tamamlandıktan sonra abonelik sistemi kullanıma hazır olacaktır</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleTestCredentials}
              disabled={testingCredentials || loading}
              variant="outline"
              size="lg"
              className="w-full bg-transparent"
            >
              {testingCredentials ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Test ediliyor...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Test iyzico Credentials
                </>
              )}
            </Button>

            <Button onClick={handleSetup} disabled={loading || testingCredentials} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kurulum yapılıyor...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  iyzico Kurulumunu Başlat
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <div className="font-semibold mb-2">Kurulum Adımları:</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Her paket için iyzico'da bir ürün oluşturulur</li>
              <li>Her ürün için aylık ve yıllık fiyatlandırma planları oluşturulur</li>
              <li>Plan referans kodları veritabanına kaydedilir</li>
              <li>Abonelik sistemi kullanıma hazır hale gelir</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
