"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShieldCheck, CreditCard, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Package {
  id: string
  name: string
  display_name_tr: string
  display_name_en: string
  max_instances: number
  price_monthly: number
  features: {
    en: string[]
    tr: string[]
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pkg, setPkg] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const packageId = searchParams.get("package")
  const language = "tr"

  useEffect(() => {
    if (!packageId) {
      router.push("/subscription")
      return
    }
    fetchPackage()
  }, [packageId])

  const fetchPackage = async () => {
    try {
      const response = await fetch("/api/packages")
      const data = await response.json()

      if (response.ok) {
        const selectedPackage = data.packages.find((p: Package) => p.id === packageId)
        if (selectedPackage) {
          setPkg(selectedPackage)
        } else {
          setError("Paket bulunamadı")
        }
      } else {
        setError("Paket bilgileri yüklenemedi")
      }
    } catch (err) {
      setError("Bağlantı hatası")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!pkg) return

    setProcessing(true)
    setError("")

    try {
      console.log("[v0] Starting checkout for package:", pkg.id)

      const response = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          billingCycle: "monthly",
        }),
      })

      const responseClone = response.clone()

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("[v0] Failed to parse response as JSON:", jsonError)
        try {
          const text = await responseClone.text()
          console.error("[v0] Response text:", text)
          setError(`Sunucu hatası: ${text.substring(0, 200)}`)
        } catch (textError) {
          console.error("[v0] Failed to read response text:", textError)
          setError("Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.")
        }
        setProcessing(false)
        return
      }

      console.log("[v0] Checkout response:", { status: response.status, data })

      if (response.ok && data.success && data.checkoutFormContent) {
        console.log("[v0] Rendering iyzico checkout form...")

        // Script tag'lerini manuel olarak çalıştır
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = data.checkoutFormContent

        // Script tag'lerini bul ve çalıştır
        const scripts = tempDiv.getElementsByTagName("script")
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i]
          const newScript = document.createElement("script")

          if (script.src) {
            newScript.src = script.src
          } else {
            newScript.textContent = script.textContent
          }

          document.body.appendChild(newScript)
        }

        // Processing state'i kapat
        setProcessing(false)
        console.log("[v0] Iyzico checkout form loaded successfully")
      } else {
        if (data.needsSetup) {
          setError(
            "Abonelik sistemi henüz kurulmamış. Lütfen önce admin panelinden iyzico kurulumunu tamamlayın. (/admin/setup-iyzico)",
          )
        } else if (data.iyzicoError) {
          setError(`iyzico Hatası: ${data.error} (Kod: ${data.iyzicoError})`)
        } else {
          setError(data.error || data.details || "Abonelik başlatılamadı")
        }
        setProcessing(false)
      }
    } catch (err) {
      console.error("[v0] Checkout error:", err)
      setError("Bağlantı hatası. Lütfen tekrar deneyin.")
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-3 text-lg">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Alert variant="destructive">
          <AlertDescription>Paket bulunamadı. Lütfen tekrar deneyin.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/subscription">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Planlara Dön
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const price = pkg.price_monthly
  const displayName = language === "tr" ? pkg.display_name_tr : pkg.display_name_en
  const features = pkg.features[language] || pkg.features.tr || []

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <Link href="/subscription">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Planlara Dön
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Özeti</CardTitle>
              <CardDescription>Seçtiğiniz paket ve fiyatlandırma detayları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">{displayName}</div>
                    <div className="text-sm text-muted-foreground">
                      {pkg.max_instances} WhatsApp Bot • Aylık Abonelik
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl">₺{(price / 100).toFixed(2).replace(".", ",")}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium">Paket Özellikleri:</div>
                <ul className="space-y-1">
                  {features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Toplam</span>
                <span>₺{(price / 100).toFixed(2).replace(".", ",")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-green-900">Güvenli Ödeme</div>
                  <div className="text-sm text-green-700">
                    Ödemeniz iyzico güvenli ödeme altyapısı ile 256-bit SSL şifreleme ile korunmaktadır. Kart
                    bilgileriniz hiçbir zaman sistemimizde saklanmaz.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ödeme Bilgileri
              </CardTitle>
              <CardDescription>Güvenli ödeme sayfasına yönlendirileceksiniz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">iyzico Güvenli Ödeme</div>
                    <div className="text-muted-foreground">Tüm kartlar kabul edilir</div>
                  </div>
                </div>

                <Button onClick={handleCheckout} disabled={processing} className="w-full" size="lg">
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ödeme sayfasına yönlendiriliyor...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Güvenli Ödemeye Geç
                    </>
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground">
                  Ödeme yaparak{" "}
                  <Link href="/terms" className="underline">
                    Kullanım Koşulları
                  </Link>{" "}
                  ve{" "}
                  <Link href="/privacy" className="underline">
                    Gizlilik Politikası
                  </Link>
                  'nı kabul etmiş olursunuz.
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="text-sm font-medium">Kabul Edilen Kartlar:</div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">Visa</Badge>
                  <Badge variant="outline">Mastercard</Badge>
                  <Badge variant="outline">Troy</Badge>
                  <Badge variant="outline">American Express</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7 Day Trial Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="font-semibold text-blue-900">7 Gün Ücretsiz Deneme</div>
                <div className="text-sm text-blue-700">
                  Yeni kullanıcılar için 7 gün ücretsiz deneme süresi. Deneme süresi sonunda otomatik olarak
                  ücretlendirme yapılmaz.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
