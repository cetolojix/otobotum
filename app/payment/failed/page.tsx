"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function PaymentFailedPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <Card className="border-red-200 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">Ödeme Başarısız</CardTitle>
          <CardDescription className="text-lg">Ödemeniz işlenirken bir hata oluştu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>
              Ödeme işleminiz tamamlanamadı. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="text-sm font-medium">Olası Nedenler:</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span>•</span>
                Kart bilgilerinde hata olabilir
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                Kartınızda yeterli bakiye bulunmuyor olabilir
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                Kartınız online ödemelere kapalı olabilir
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                Bankanız işlemi reddetmiş olabilir
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-900">
              <strong>Yardıma mı ihtiyacınız var?</strong>
              <p className="mt-1 text-blue-700">
                Sorun devam ederse lütfen bankanızla iletişime geçin veya destek ekibimize ulaşın.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1" size="lg">
              <Link href="/subscription">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tekrar Dene
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent" size="lg">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard'a Dön
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <Link href="/support" className="text-sm text-primary hover:underline">
              Destek ekibiyle iletişime geç
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
