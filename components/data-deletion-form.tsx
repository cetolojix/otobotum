"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function DataDeletionForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    reason: "",
    description: "",
    confirmed: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.confirmed) {
      alert("Lütfen veri silme talebinizi onaylayın")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/data-deletion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert("Bir hata oluştu. Lütfen tekrar deneyin.")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      alert("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/40">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-foreground">Talebiniz Alındı</h3>
        <p className="text-muted-foreground leading-relaxed">
          Veri silme talebiniz başarıyla alındı. Talebiniz en geç 30 gün içerisinde değerlendirilecek ve e-posta
          adresinize bilgilendirme yapılacaktır.
        </p>
        <p className="text-sm text-muted-foreground">
          Referans No: <span className="text-neon-cyan font-mono">{Date.now()}</span>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-foreground">
          Ad Soyad <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Adınız ve soyadınız"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
          className="bg-background/50 border-border/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          E-posta Adresi <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="ornek@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="bg-background/50 border-border/50"
        />
        <p className="text-xs text-muted-foreground">Hesabınızda kayıtlı e-posta adresinizi girin</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-foreground">
          Telefon Numarası
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="05XX XXX XX XX"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="bg-background/50 border-border/50"
        />
        <p className="text-xs text-muted-foreground">Opsiyonel - Kimlik doğrulama için kullanılabilir</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason" className="text-foreground">
          Silme Nedeni
        </Label>
        <select
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan"
        >
          <option value="">Seçiniz</option>
          <option value="no-longer-needed">Artık hizmeti kullanmıyorum</option>
          <option value="privacy-concerns">Gizlilik endişelerim var</option>
          <option value="switching-service">Başka bir hizmete geçiyorum</option>
          <option value="other">Diğer</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">
          Açıklama
        </Label>
        <Textarea
          id="description"
          placeholder="Veri silme talebiniz hakkında ek bilgi verebilirsiniz (opsiyonel)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="bg-background/50 border-border/50"
        />
      </div>

      <div className="flex items-start space-x-3 bg-background/50 border border-border/50 rounded-xl p-4">
        <Checkbox
          id="confirmed"
          checked={formData.confirmed}
          onCheckedChange={(checked) => setFormData({ ...formData, confirmed: checked as boolean })}
          className="mt-1"
        />
        <div className="space-y-1">
          <Label htmlFor="confirmed" className="text-sm font-medium text-foreground cursor-pointer">
            Veri silme talebimi onaylıyorum <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tüm kişisel verilerimin kalıcı olarak silineceğini ve bu işlemin geri alınamayacağını anladım. Hesabıma
            erişimimin sonlandırılacağını kabul ediyorum.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !formData.confirmed}
        className="w-full tech-button text-white font-bold py-6 text-lg"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Gönderiliyor...
          </span>
        ) : (
          "Veri Silme Talebini Gönder"
        )}
      </Button>
    </form>
  )
}
