"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Building, Save, ArrowLeft, Shield, Calendar, LogOut, MapPin } from "lucide-react"
import { debugLog } from "@/lib/debug"

const turkishCities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Osmaniye",
  "Düzce",
]

const cityDistricts: Record<string, string[]> = {
  İstanbul: [
    "Adalar",
    "Arnavutköy",
    "Ataşehir",
    "Avcılar",
    "Bağcılar",
    "Bahçelievler",
    "Bakırköy",
    "Başakşehir",
    "Bayrampaşa",
    "Beşiktaş",
    "Beykoz",
    "Beylikdüzü",
    "Beyoğlu",
    "Büyükçekmece",
    "Çatalca",
    "Çekmeköy",
    "Esenler",
    "Esenyurt",
    "Eyüpsultan",
    "Fatih",
    "Gaziosmanpaşa",
    "Güngören",
    "Kadıköy",
    "Kağıthane",
    "Kartal",
    "Küçükçekmece",
    "Maltepe",
    "Pendik",
    "Sancaktepe",
    "Sarıyer",
    "Silivri",
    "Sultanbeyli",
    "Sultangazi",
    "Şile",
    "Şişli",
    "Tuzla",
    "Ümraniye",
    "Üsküdar",
    "Zeytinburnu",
  ],
  Ankara: [
    "Akyurt",
    "Altındağ",
    "Ayaş",
    "Bala",
    "Beypazarı",
    "Çamlıdere",
    "Çankaya",
    "Çubuk",
    "Elmadağ",
    "Etimesgut",
    "Evren",
    "Gölbaşı",
    "Güdül",
    "Haymana",
    "Kalecik",
    "Kazan",
    "Keçiören",
    "Kızılcahamam",
    "Mamak",
    "Nallıhan",
    "Polatlı",
    "Pursaklar",
    "Sincan",
    "Şereflikoçhisar",
    "Yenimahalle",
  ],
  İzmir: [
    "Aliağa",
    "Balçova",
    "Bayındır",
    "Bayraklı",
    "Bergama",
    "Beydağ",
    "Bornova",
    "Buca",
    "Çeşme",
    "Çiğli",
    "Dikili",
    "Foça",
    "Gaziemir",
    "Güzelbahçe",
    "Karabağlar",
    "Karaburun",
    "Karşıyaka",
    "Kemalpaşa",
    "Kınık",
    "Kiraz",
    "Konak",
    "Menderes",
    "Menemen",
    "Narlıdere",
    "Ödemiş",
    "Seferihisar",
    "Selçuk",
    "Tire",
    "Torbalı",
    "Urla",
  ],
}

interface ProfilePageProps {
  user: any
  profile: any
}

export function ProfilePage({ user, profile }: ProfilePageProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    address: profile.address || "",
    city: profile.city || "",
    district: profile.district || "", // İlçe alanı eklendi
    company_name: profile.company_name || "",
    company_address: profile.company_address || "",
    company_tax_number: profile.company_tax_number || "",
    company_website: profile.company_website || "",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleCityChange = (selectedCity: string) => {
    setFormData((prev) => ({
      ...prev,
      city: selectedCity,
      district: "", // İl değiştiğinde ilçeyi sıfırla
    }))
  }

  const getDistrictsForCity = (selectedCity: string): string[] => {
    return cityDistricts[selectedCity] || []
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage("")

    try {
      const { error } = await supabase.from("profiles").update(formData).eq("id", user.id)

      if (error) {
        debugLog("Error updating profile:", error)
        setMessage("Profil güncellenirken hata oluştu: " + error.message)
        return
      }

      setMessage("Profil başarıyla güncellendi!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      debugLog("Error updating profile:", error)
      setMessage("Beklenmeyen bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (profile.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/instances")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/90 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-neon-blue/30">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-bold tech-gradient">WhatsApp Yapay Zeka</span>
                <div className="text-xs text-muted-foreground font-medium hidden sm:block">Profil Ayarları</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-muted-foreground font-medium hidden md:block">
                <span className="text-neon-cyan">{profile?.full_name || user.email}</span>
              </span>
              <Badge variant={profile.role === "admin" ? "destructive" : "secondary"} className="hologram-card">
                <Shield className="h-3 w-3 mr-1" />
                {profile.role === "admin" ? "Admin" : "Kullanıcı"}
              </Badge>
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="hologram-card hover:bg-secondary/30 transition-all duration-300 bg-transparent p-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Geri Dön</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="hologram-card hover:bg-secondary/30 transition-all duration-300 bg-transparent p-2 sm:px-3"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Çıkış Yap</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <div className="absolute top-20 left-10 w-4 h-4 bg-neon-cyan rounded-full floating-element opacity-80 shadow-lg shadow-neon-cyan/50"></div>
        <div className="absolute top-40 right-20 w-6 h-6 border-2 border-neon-purple rounded-full floating-element opacity-70 shadow-lg shadow-neon-purple/30"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-tech-orange rounded-full floating-element opacity-80 shadow-lg shadow-tech-orange/50"></div>

        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-10">
          {message && (
            <Card
              className={`hologram-card border-0 backdrop-blur-sm shadow-2xl animate-fade-in ${
                message.includes("hata")
                  ? "bg-gradient-to-r from-red-50/10 to-red-100/10"
                  : "bg-gradient-to-r from-green-50/10 to-emerald-50/10"
              }`}
            >
              <CardContent className="p-4">
                <div
                  className={`text-center font-medium ${message.includes("hata") ? "text-red-400" : "text-green-400"}`}
                >
                  {message}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-1">
              <Card className="hologram-card border-0 bg-background/80 backdrop-blur-sm shadow-2xl sticky top-8">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-neon-blue/30">
                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl neon-text">
                    {formData.full_name || "İsimsiz Kullanıcı"}
                  </CardTitle>
                  <CardDescription className="flex items-center justify-center gap-2 text-neon-cyan text-sm">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Kayıt: {new Date(profile.created_at).toLocaleDateString("tr-TR")}</span>
                  </div>
                  {formData.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-neon-cyan" />
                      <span>{formData.phone}</span>
                    </div>
                  )}
                  {(formData.city || formData.district) && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-neon-cyan" />
                      <span>
                        {formData.city}
                        {formData.district && ` / ${formData.district}`}
                      </span>
                    </div>
                  )}
                  {formData.company_name && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building className="h-4 w-4 text-neon-cyan" />
                      <span className="truncate">{formData.company_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="hologram-card border-0 bg-background/80 backdrop-blur-sm shadow-2xl animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 neon-text text-lg sm:text-xl">
                    <User className="h-5 w-5" />
                    Kişisel Bilgiler
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Temel kişisel bilgilerinizi güncelleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Ad Soyad</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        placeholder="Adınız ve soyadınız"
                        className="hologram-card bg-background/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="hologram-card bg-muted/50 border-border/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon Numarası</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+90 555 123 45 67"
                      className="hologram-card bg-background/50 border-border/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">İl</Label>
                      <Select value={formData.city} onValueChange={handleCityChange}>
                        <SelectTrigger className="hologram-card bg-background/50 border-border/50">
                          <SelectValue placeholder="İl seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {turkishCities.map((cityName) => (
                            <SelectItem key={cityName} value={cityName}>
                              {cityName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.city && (
                      <div className="space-y-2">
                        <Label htmlFor="district">İlçe</Label>
                        <Select
                          value={formData.district}
                          onValueChange={(value) => handleInputChange("district", value)}
                        >
                          <SelectTrigger className="hologram-card bg-background/50 border-border/50">
                            <SelectValue placeholder="İlçe seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {getDistrictsForCity(formData.city).map((districtName) => (
                              <SelectItem key={districtName} value={districtName}>
                                {districtName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adres</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Tam adresiniz"
                      rows={3}
                      className="hologram-card bg-background/50 border-border/50"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="hologram-card border-0 bg-background/80 backdrop-blur-sm shadow-2xl animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 neon-text text-lg sm:text-xl">
                    <Building className="h-5 w-5" />
                    Şirket Bilgileri
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    İş ve şirket bilgilerinizi güncelleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Şirket Adı</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      placeholder="Şirket adınız"
                      className="hologram-card bg-background/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_address">Şirket Adresi</Label>
                    <Textarea
                      id="company_address"
                      value={formData.company_address}
                      onChange={(e) => handleInputChange("company_address", e.target.value)}
                      placeholder="Şirket adresi"
                      rows={3}
                      className="hologram-card bg-background/50 border-border/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_tax_number">Vergi Numarası</Label>
                      <Input
                        id="company_tax_number"
                        value={formData.company_tax_number}
                        onChange={(e) => handleInputChange("company_tax_number", e.target.value)}
                        placeholder="Vergi numarası"
                        className="hologram-card bg-background/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_website">Şirket Web Sitesi</Label>
                      <Input
                        id="company_website"
                        value={formData.company_website}
                        onChange={(e) => handleInputChange("company_website", e.target.value)}
                        placeholder="https://sirketiniz.com"
                        className="hologram-card bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  size="lg"
                  className="tech-button gap-2 px-4 sm:px-6 py-2 sm:py-3 text-white font-bold shadow-2xl shadow-neon-blue/30 min-w-32 sm:min-w-48"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Kaydediliyor...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span className="hidden sm:inline">Değişiklikleri Kaydet</span>
                      <span className="sm:hidden">Kaydet</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
