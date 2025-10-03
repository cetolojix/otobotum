"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Subscription {
  package_id: string
  status: string
  started_at: string
  expires_at: string
  auto_renew: boolean
  is_trial: boolean
  trial_ends_at: string
  payment_method: string
  packages: {
    name: string
    display_name_tr: string
    display_name_en: string
    max_instances: number
    price_monthly: number
    price_yearly: number
    features: string[]
  }
}

interface Transaction {
  id: string
  amount: number
  currency: string
  billing_cycle: string
  payment_status: string
  created_at: string
  paid_at: string
  card_association: string
  card_last_four: string
}

interface SubscriptionDashboardProps {
  language?: string
}

export function SubscriptionDashboard({ language = "tr" }: SubscriptionDashboardProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [subRes, transRes] = await Promise.all([
        fetch("/api/user/subscription-details"),
        fetch("/api/user/payment-history"),
      ])

      const subData = await subRes.json()
      const transData = await transRes.json()

      if (subRes.ok) {
        setSubscription(subData.subscription)
      }

      if (transRes.ok) {
        setTransactions(transData.transactions || [])
      }
    } catch (err) {
      setError("Veriler yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setCanceling(true)
    setError("")

    try {
      const response = await fetch("/api/user/cancel-subscription", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        await fetchData()
        alert("Aboneliğiniz iptal edildi. Mevcut dönem sonuna kadar hizmet almaya devam edeceksiniz.")
      } else {
        setError(data.error || "İptal işlemi başarısız")
      }
    } catch (err) {
      setError("Bağlantı hatası")
    } finally {
      setCanceling(false)
    }
  }

  const handleReactivate = async () => {
    router.push("/subscription")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Yükleniyor...</span>
      </div>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aktif aboneliğiniz bulunmuyor.{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/subscription")}>
                Bir plan seçin
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const displayName = language === "tr" ? subscription.packages.display_name_tr : subscription.packages.display_name_en
  const isActive = subscription.status === "active"
  const isCancelled = subscription.status === "cancelled"
  const isExpired = subscription.status === "expired"
  const isInTrial = subscription.is_trial && subscription.trial_ends_at

  const daysUntilExpiry = subscription.expires_at
    ? Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  const trialDaysLeft = isInTrial
    ? Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Trial Alert */}
      {isInTrial && trialDaysLeft > 0 && (
        <Alert className="border-blue-500 bg-blue-50">
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <strong>Deneme süreniz aktif!</strong> {trialDaysLeft} gün sonra deneme süreniz sona erecek.
            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push("/subscription")}>
              Şimdi yükselt
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Expiring Soon Alert */}
      {!isInTrial && isActive && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
        <Alert className="border-amber-500 bg-amber-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aboneliğiniz {daysUntilExpiry} gün içinde sona erecek. Kesintisiz hizmet için yenileyin.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{displayName}</CardTitle>
                <CardDescription>
                  {subscription.packages.max_instances} WhatsApp Bot • {subscription.packages.price_monthly} TL/ay
                </CardDescription>
              </div>
            </div>
            <Badge variant={isActive ? "default" : isCancelled ? "secondary" : "destructive"}>
              {isActive ? "Aktif" : isCancelled ? "İptal Edildi" : "Süresi Doldu"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Başlangıç Tarihi</div>
              <div className="font-medium">{new Date(subscription.started_at).toLocaleDateString("tr-TR")}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Bitiş Tarihi</div>
              <div className="font-medium">
                {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString("tr-TR") : "Süresiz"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Otomatik Yenileme</div>
              <div className="font-medium">{subscription.auto_renew ? "Açık" : "Kapalı"}</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-medium">Paket Özellikleri:</div>
            <div className="grid md:grid-cols-2 gap-2">
              {subscription.packages.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push("/subscription")} variant="default">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Paketi Yükselt
            </Button>

            {isActive && !isCancelled && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">İptal Et</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Aboneliği İptal Et</DialogTitle>
                    <DialogDescription>
                      Aboneliğinizi iptal etmek istediğinizden emin misiniz? Mevcut dönem sonuna kadar hizmet almaya
                      devam edeceksiniz.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => {}}>
                      Vazgeç
                    </Button>
                    <Button variant="destructive" onClick={handleCancelSubscription} disabled={canceling}>
                      {canceling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          İptal Ediliyor...
                        </>
                      ) : (
                        "İptal Et"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {isCancelled && (
              <Button onClick={handleReactivate} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Yeniden Aktifleştir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Ödeme Geçmişi
          </CardTitle>
          <CardDescription>Son ödemeleriniz ve fatura bilgileri</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Henüz ödeme kaydı bulunmuyor</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Dönem</TableHead>
                  <TableHead>Kart</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.created_at).toLocaleDateString("tr-TR")}</TableCell>
                    <TableCell className="font-medium">
                      {transaction.amount} {transaction.currency}
                    </TableCell>
                    <TableCell>{transaction.billing_cycle === "yearly" ? "Yıllık" : "Aylık"}</TableCell>
                    <TableCell>
                      {transaction.card_association && transaction.card_last_four
                        ? `${transaction.card_association} •••• ${transaction.card_last_four}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {transaction.payment_status === "success" ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Başarılı
                        </Badge>
                      ) : transaction.payment_status === "pending" ? (
                        <Badge variant="secondary">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Bekliyor
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Başarısız
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
