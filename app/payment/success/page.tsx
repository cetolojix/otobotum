"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    setLoading(false)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <Card className="border-green-200 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">Ödeme Başarılı!</CardTitle>
          <CardDescription className="text-lg">Aboneliğiniz başarıyla oluşturuldu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
            <div className="font-semibold text-green-900">Tebrikler!</div>
            <p className="text-green-700">
              Ödemeniz başarıyla alındı ve aboneliğiniz aktif edildi. Artık tüm premium özelliklere erişebilirsiniz.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Sonraki Adımlar:</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500">1.</span>
                Dashboard'unuza gidin ve WhatsApp botlarınızı oluşturmaya başlayın
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">2.</span>
                Bot ayarlarınızı yapılandırın ve AI promptlarınızı özelleştirin
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">3.</span>
                Müşterilerinizle otomatik mesajlaşmaya başlayın
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1" size="lg">
              <Link href="/dashboard">
                Dashboard'a Git
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent" size="lg">
              <Link href="/subscription">Aboneliğimi Görüntüle</Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4">
            Fatura bilgileriniz e-posta adresinize gönderildi.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
