"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, Crown, Zap, Star, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface Package {
  id: string
  name: string
  display_name_tr: string
  display_name_en: string
  max_instances: number
  price_monthly: number
  price_yearly: number
  features: string[]
  is_active: boolean
}

interface SubscriptionCardProps {
  pkg: Package
  language: string
  isCurrentPackage?: boolean
  billingCycle: "monthly" | "yearly"
  onSelect?: (packageId: string, billingCycle: "monthly" | "yearly") => void
}

export function SubscriptionCard({ pkg, language, isCurrentPackage, billingCycle, onSelect }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const getPackageIcon = (packageName: string) => {
    switch (packageName) {
      case "basic":
        return <Zap className="h-6 w-6" />
      case "premium":
        return <Star className="h-6 w-6" />
      case "pro":
        return <Crown className="h-6 w-6" />
      default:
        return <Sparkles className="h-6 w-6" />
    }
  }

  const getPackageColor = (packageName: string) => {
    switch (packageName) {
      case "basic":
        return "from-blue-500 to-cyan-500"
      case "premium":
        return "from-purple-500 to-pink-500"
      case "pro":
        return "from-amber-500 to-orange-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  const displayName = language === "tr" ? pkg.display_name_tr : pkg.display_name_en
  const price = billingCycle === "yearly" ? pkg.price_yearly : pkg.price_monthly
  const monthlyPrice = billingCycle === "yearly" ? (pkg.price_yearly / 12).toFixed(2) : pkg.price_monthly

  const handleSubscribe = async () => {
    if (isCurrentPackage || loading) return

    setLoading(true)
    try {
      if (onSelect) {
        onSelect(pkg.id, billingCycle)
      } else {
        // Redirect to checkout
        router.push(`/checkout?package=${pkg.id}&cycle=${billingCycle}`)
      }
    } catch (error) {
      console.error("[v0] Error selecting package:", error)
    } finally {
      setLoading(false)
    }
  }

  const isFree = price === 0

  return (
    <Card
      className={`relative transition-all duration-300 hover:shadow-xl ${
        isCurrentPackage ? "border-primary shadow-lg ring-2 ring-primary" : "border-border"
      }`}
    >
      {isCurrentPackage && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-4 py-1">
            <Check className="h-3 w-3 mr-1" />
            {language === "tr" ? "Aktif Paket" : "Active Package"}
          </Badge>
        </div>
      )}

      {pkg.name === "premium" && !isCurrentPackage && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
            {language === "tr" ? "En Popüler" : "Most Popular"}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center space-y-4 pb-8">
        <div
          className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${getPackageColor(pkg.name)} flex items-center justify-center text-white shadow-lg`}
        >
          {getPackageIcon(pkg.name)}
        </div>

        <div>
          <CardTitle className="text-2xl mb-2">{displayName}</CardTitle>
          <CardDescription className="text-base">
            {pkg.max_instances} {language === "tr" ? "WhatsApp Bot" : "WhatsApp Bots"}
          </CardDescription>
        </div>

        <div className="space-y-1">
          {isFree ? (
            <div className="text-4xl font-bold">{language === "tr" ? "Ücretsiz" : "Free"}</div>
          ) : (
            <>
              <div className="text-4xl font-bold">₺{price}</div>
              <div className="text-sm text-muted-foreground">
                {billingCycle === "yearly" ? (
                  <>
                    {language === "tr" ? "yıllık" : "per year"} • ₺{monthlyPrice}/{language === "tr" ? "ay" : "mo"}
                  </>
                ) : (
                  <>{language === "tr" ? "aylık" : "per month"}</>
                )}
              </div>
              {billingCycle === "yearly" && (
                <Badge variant="secondary" className="mt-2">
                  {language === "tr" ? "2 ay ücretsiz" : "2 months free"}
                </Badge>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={handleSubscribe}
          disabled={isCurrentPackage || loading}
          className="w-full"
          size="lg"
          variant={isCurrentPackage ? "secondary" : "default"}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {language === "tr" ? "İşleniyor..." : "Processing..."}
            </>
          ) : isCurrentPackage ? (
            language === "tr" ? (
              "Mevcut Paket"
            ) : (
              "Current Package"
            )
          ) : isFree ? (
            language === "tr" ? (
              "Ücretsiz Başla"
            ) : (
              "Start Free"
            )
          ) : language === "tr" ? (
            "Satın Al"
          ) : (
            "Subscribe"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
