"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SubscriptionCard } from "@/components/subscription-card"
import { Loader2, Shield, CreditCard, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface Package {
  id: string
  name: string
  display_name_tr: string
  display_name_en: string
  max_instances: number
  price_monthly: number
  features: string[]
  is_active: boolean
}

interface UserSubscription {
  package_id: string
  status: string
  started_at: string
  expires_at: string
  is_trial: boolean
  trial_ends_at: string
}

export default function SubscriptionPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const language = "tr" // Get from context/props

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [packagesRes, subscriptionRes] = await Promise.all([
        fetch("/api/packages"),
        fetch("/api/user/subscription-status"),
      ])

      const packagesData = await packagesRes.json()
      const subscriptionData = await subscriptionRes.json()

      if (packagesRes.ok) {
        setPackages(packagesData.packages || [])
      }

      if (subscriptionRes.ok) {
        setCurrentSubscription(subscriptionData.subscription)
      }
    } catch (err) {
      setError("Failed to load subscription data")
    } finally {
      setLoading(false)
    }
  }

  const handlePackageSelect = (packageId: string) => {
    router.push(`/checkout?package=${packageId}`)
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

  const isInTrial = currentSubscription?.is_trial && currentSubscription?.trial_ends_at
  const trialDaysLeft = isInTrial
    ? Math.ceil((new Date(currentSubscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Abonelik Planları</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          İhtiyacınıza uygun planı seçin ve WhatsApp otomasyonunun gücünü keşfedin
        </p>
      </div>

      {/* Trial Alert */}
      {isInTrial && trialDaysLeft > 0 && (
        <Alert className="mb-8 border-blue-500 bg-blue-50">
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <strong>Deneme süreniz aktif!</strong> {trialDaysLeft} gün sonra deneme süreniz sona erecek. Kesintisiz
            hizmet için bir plan seçin.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Package Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {packages.map((pkg) => (
          <SubscriptionCard
            key={pkg.id}
            pkg={pkg}
            language={language}
            isCurrentPackage={currentSubscription?.package_id === pkg.id}
            billingCycle="monthly"
            onSelect={handlePackageSelect}
          />
        ))}
      </div>

      {/* Security & Payment Info */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-green-500 mb-2" />
            <CardTitle className="text-lg">Güvenli Ödeme</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">256-bit SSL şifreleme ile korunan iyzico altyapısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CreditCard className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle className="text-lg">Tüm Kartlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Visa, Mastercard, Troy ve American Express kabul edilir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Calendar className="h-8 w-8 text-purple-500 mb-2" />
            <CardTitle className="text-lg">7 Gün Deneme</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tüm yeni kullanıcılar için ücretsiz deneme süresi</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Sıkça Sorulan Sorular</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deneme süresi nasıl çalışır?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yeni kullanıcılar 7 gün boyunca ücretsiz olarak tüm özellikleri deneyebilir. Deneme süresi sonunda
                otomatik olarak ücretlendirme yapılmaz.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">İstediğim zaman iptal edebilir miyim?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Evet, aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar
                hizmet almaya devam edersiniz.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ödeme güvenli mi?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tüm ödemeler iyzico güvenli ödeme altyapısı üzerinden gerçekleştirilir. Kart bilgileriniz hiçbir zaman
                sistemimizde saklanmaz.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
