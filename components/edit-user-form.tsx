"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUserProfile } from "@/app/actions/admin-actions"
import { useRouter } from "next/navigation"
import { User, MapPin, Building, ArrowLeft } from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  phone: string | null
  username: string | null
  address: string | null
  city: string | null
  district: string | null
  company_name: string | null
  company_address: string | null
  company_tax_number: string | null
  company_website: string | null
  account_type: string | null
}

interface EditUserFormProps {
  user: Profile
}

export function EditUserForm({ user }: EditUserFormProps) {
  const [editingUser, setEditingUser] = useState<Profile>(user)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateUserProfile(editingUser.id, {
        full_name: editingUser.full_name,
        role: editingUser.role,
        phone: editingUser.phone,
        username: editingUser.username,
        address: editingUser.address,
        city: editingUser.city,
        district: editingUser.district,
        company_name: editingUser.company_name,
        company_address: editingUser.company_address,
        company_tax_number: editingUser.company_tax_number,
        company_website: editingUser.company_website,
        account_type: editingUser.account_type,
      })

      if (result.error) {
        alert("Kullanıcı güncellenirken hata oluştu: " + result.error)
        return
      }

      alert("Kullanıcı başarıyla güncellendi!")
      window.close()
    } catch (error) {
      alert("Kullanıcı güncellenirken beklenmeyen bir hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" onClick={() => window.close()} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kapat
          </Button>
          <div>
            <h1 className="text-4xl font-bold tech-gradient">Kullanıcı Düzenle</h1>
            <p className="text-muted-foreground mt-2">Kullanıcının tüm profil bilgilerini düzenleyin</p>
          </div>
        </div>

        <div className="hologram-card p-8 rounded-3xl space-y-8">
          {/* Temel Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold neon-text flex items-center gap-2">
              <User className="h-5 w-5" />
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={editingUser.email} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input
                  id="fullName"
                  value={editingUser.full_name || ""}
                  onChange={(e) => setEditingUser((prev) => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Ad Soyad"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  value={editingUser.username || ""}
                  onChange={(e) => setEditingUser((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Kullanıcı adı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={editingUser.phone || ""}
                  onChange={(e) => setEditingUser((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={editingUser.role}
                onValueChange={(value) => setEditingUser((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="hologram-card border-0">
                  <SelectItem value="user">Kullanıcı</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="suspended">Askıya Alınmış</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Hesap Tipi</Label>
              <Select
                value={editingUser.account_type || "individual"}
                onValueChange={(value) => setEditingUser((prev) => ({ ...prev, account_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="hologram-card border-0">
                  <SelectItem value="individual">Bireysel</SelectItem>
                  <SelectItem value="corporate">Kurumsal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Adres Bilgileri */}
          <div className="border-t border-border/30 pt-6 space-y-4">
            <h3 className="text-lg font-semibold neon-text flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adres Bilgileri
            </h3>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={editingUser.address || ""}
                onChange={(e) => setEditingUser((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Tam adres"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">İl</Label>
                <Input
                  id="city"
                  value={editingUser.city || ""}
                  onChange={(e) => setEditingUser((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="İl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">İlçe</Label>
                <Input
                  id="district"
                  value={editingUser.district || ""}
                  onChange={(e) => setEditingUser((prev) => ({ ...prev, district: e.target.value }))}
                  placeholder="İlçe"
                />
              </div>
            </div>
          </div>

          {/* Şirket Bilgileri */}
          <div className="border-t border-border/30 pt-6 space-y-4">
            <h3 className="text-lg font-semibold neon-text flex items-center gap-2">
              <Building className="h-5 w-5" />
              Şirket Bilgileri
            </h3>
            <div className="space-y-2">
              <Label htmlFor="companyName">Şirket Adı</Label>
              <Input
                id="companyName"
                value={editingUser.company_name || ""}
                onChange={(e) => setEditingUser((prev) => ({ ...prev, company_name: e.target.value }))}
                placeholder="Şirket adı"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Şirket Adresi</Label>
              <Input
                id="companyAddress"
                value={editingUser.company_address || ""}
                onChange={(e) => setEditingUser((prev) => ({ ...prev, company_address: e.target.value }))}
                placeholder="Şirket adresi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyTaxNumber">Vergi Numarası</Label>
                <Input
                  id="companyTaxNumber"
                  value={editingUser.company_tax_number || ""}
                  onChange={(e) => setEditingUser((prev) => ({ ...prev, company_tax_number: e.target.value }))}
                  placeholder="Vergi numarası"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  value={editingUser.company_website || ""}
                  onChange={(e) => setEditingUser((prev) => ({ ...prev, company_website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-border/30">
            <Button variant="outline" onClick={() => window.close()} disabled={isSaving}>
              İptal
            </Button>
            <Button onClick={handleSave} className="tech-button" disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
