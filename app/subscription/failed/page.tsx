"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function SubscriptionFailedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-center text-2xl">Ödeme Başarısız</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/subscription")} variant="outline" className="flex-1">
              Tekrar Dene
            </Button>
            <Button onClick={() => router.push("/instances")} className="flex-1">
              Panele Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
