"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Check, Crown, Zap, Star, Sparkles } from "lucide-react"
import { getTranslation } from "@/lib/i18n"

interface Package {
  id: string
  name: string
  display_name_tr: string
  display_name_en: string
  max_instances: number
  price_monthly: number
  price_yearly: number
  features: { tr: string[]; en: string[] } | string[]
  is_active: boolean
}

interface PackageInfo {
  user_id: string
  package_name: string
  display_name_tr: string
  display_name_en: string
  max_instances: number
  current_instances: number
  remaining_instances: number
  subscription_status: string
}

interface PackageSelectorProps {
  language: string
  onPackageChange?: (packageInfo: PackageInfo) => void
}

export function PackageSelector({ language, onPackageChange }: PackageSelectorProps) {
  const t = getTranslation(language)
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [currentPackage, setCurrentPackage] = useState<PackageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPackages()
    fetchCurrentPackage()
  }, [])

  const fetchPackages = async () => {
    try {
      console.log("[v0] Fetching packages...")
      const response = await fetch("/api/packages")
      const data = await response.json()
      console.log("[v0] Packages response:", { status: response.status, data })

      if (response.ok) {
        setPackages(data.packages)
      } else {
        const errorMsg = data.error || "Paketler yüklenirken hata oluştu"
        console.log("[v0] Packages fetch error:", errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.log("[v0] Packages network error:", err)
      setError(
        language === "tr" ? "Bağlantı hatası: Paketler yüklenemedi" : "Connection error: Failed to load packages",
      )
    }
  }

  const fetchCurrentPackage = async () => {
    try {
      console.log("[v0] Fetching current package...")
      const response = await fetch("/api/user/package-info")
      const data = await response.json()
      console.log("[v0] Current package response:", { status: response.status, data })

      if (response.ok) {
        setCurrentPackage(data.packageInfo)
      } else {
        const errorMsg = data.error || "Mevcut paket bilgisi alınamadı"
        console.log("[v0] Current package fetch error:", errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.log("[v0] Current package network error:", err)
      setError(
        language === "tr"
          ? "Bağlantı hatası: Paket bilgisi alınamadı"
          : "Connection error: Failed to load package info",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (packageName: string) => {
    console.log("[v0] Handle upgrade called for package:", packageName)

    if (currentPackage?.package_name === packageName) {
      console.log("[v0] Package already selected, skipping")
      return
    }

    const selectedPackage = packages.find((pkg) => pkg.name === packageName)
    console.log("[v0] Selected package:", selectedPackage)

    if (!selectedPackage) {
      const errorMsg = language === "tr" ? "Paket bulunamadı" : "Package not found"
      console.log("[v0] Package not found error")
      setError(errorMsg)
      return
    }

    if (selectedPackage.price_monthly > 0) {
      console.log("[v0] Redirecting to checkout for paid package:", selectedPackage.id)
      router.push(`/checkout?package=${selectedPackage.id}&cycle=monthly`)
      return
    }

    setUpgrading(packageName)
    setError("")

    try {
      console.log("[v0] Upgrading to free package:", packageName)
      const response = await fetch("/api/user/upgrade-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageName }),
      })

      const data = await response.json()
      console.log("[v0] Upgrade response:", { status: response.status, data })

      if (response.ok) {
        console.log("[v0] Upgrade successful, refreshing package info")
        await fetchCurrentPackage()
        if (currentPackage) {
          onPackageChange?.({
            ...currentPackage,
            package_name: packageName,
          })
        }
      } else {
        const errorMsg = data.error || "Paket yükseltme başarısız"
        console.log("[v0] Upgrade error:", errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.log("[v0] Upgrade network error:", err)
      setError(
        language === "tr" ? "Bağlantı hatası: Paket güncellenemedi" : "Connection error: Failed to update package",
      )
    } finally {
      setUpgrading(null)
    }
  }

  const getPackageIcon = (packageName: string) => {
    switch (packageName) {
      case "basic":
        return <Zap className="h-5 w-5" />
      case "plus":
      case "premium":
        return <Star className="h-5 w-5" />
      case "pro":
        return <Crown className="h-5 w-5" />
      case "custom":
        return <Sparkles className="h-5 w-5" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  const getPackageColor = (packageName: string) => {
    switch (packageName) {
      case "basic":
        return "border-blue-200 bg-blue-50"
      case "plus":
      case "premium":
        return "border-purple-200 bg-purple-50"
      case "pro":
        return "border-amber-200 bg-amber-50"
      case "custom":
        return "border-emerald-200 bg-emerald-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">{language === "tr" ? "Paketler yükleniyor..." : "Loading packages..."}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentPackage && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPackageIcon(currentPackage.package_name)}
              {language === "tr" ? "Mevcut Paketiniz" : "Your Current Package"}
            </CardTitle>
            <CardDescription>
              <span className="font-semibold">
                {language === "tr" ? currentPackage.display_name_tr : currentPackage.display_name_en}
              </span>
              {" - "}
              {currentPackage.current_instances}/{currentPackage.max_instances}{" "}
              {language === "tr" ? "bot kullanımda" : "bots in use"}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => {
          const isCurrentPackage = currentPackage?.package_name === pkg.name
          const isUpgrading = upgrading === pkg.name
          const displayName = language === "tr" ? pkg.display_name_tr : pkg.display_name_en

          let features: string[] = []
          if (pkg.features) {
            if (typeof pkg.features === "object" && !Array.isArray(pkg.features)) {
              features = pkg.features[language as "tr" | "en"] || []
            } else if (Array.isArray(pkg.features)) {
              features = pkg.features
            }
          }

          return (
            <Card
              key={pkg.id}
              className={`relative transition-all duration-200 ${
                isCurrentPackage ? "border-primary bg-primary/5 shadow-md" : getPackageColor(pkg.name)
              }`}
            >
              {isCurrentPackage && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    {language === "tr" ? "Aktif" : "Active"}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">{getPackageIcon(pkg.name)}</div>
                <CardTitle className="text-xl">{displayName}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">
                    {pkg.price_monthly === 0 || pkg.name === "custom"
                      ? language === "tr"
                        ? "Görüşmeli"
                        : "Contact Us"
                      : `₺${pkg.price_monthly.toLocaleString("tr-TR")}`}
                  </span>
                  {pkg.price_monthly > 0 && pkg.name !== "custom" && (
                    <span className="text-sm text-muted-foreground">/{language === "tr" ? "ay" : "month"}</span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {pkg.max_instances >= 999 || pkg.name === "custom"
                      ? language === "tr"
                        ? "Sınırsız"
                        : "Unlimited"
                      : `${pkg.max_instances} ${language === "tr" ? "WhatsApp Bot" : "WhatsApp Bots"}`}
                  </div>
                </div>

                <ul className="space-y-2 text-sm">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-left">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(pkg.name)}
                  disabled={isCurrentPackage || isUpgrading || pkg.name === "custom"}
                  className="w-full"
                  variant={isCurrentPackage ? "secondary" : pkg.name === "custom" ? "outline" : "default"}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === "tr" ? "Yükseltiliyor..." : "Upgrading..."}
                    </>
                  ) : isCurrentPackage ? (
                    language === "tr" ? (
                      "Mevcut Paket"
                    ) : (
                      "Current Package"
                    )
                  ) : pkg.name === "custom" ? (
                    language === "tr" ? (
                      "İletişime Geçin"
                    ) : (
                      "Contact Us"
                    )
                  ) : language === "tr" ? (
                    "Bu Paketi Seç"
                  ) : (
                    "Select This Package"
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
