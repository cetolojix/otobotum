"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function RefundForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    orderNumber: "",
    paymentDate: "",
    amount: "",
    reason: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("İade talebi gönderilemedi")
      }

      toast({
        title: "İade Talebi Alındı",
        description: "Talebiniz başarıyla kaydedildi. En kısa sürede size dönüş yapacağız.",
      })

      // Form'u temizle
      setFormData({
        fullName: "",
        email: "",
        orderNumber: "",
        paymentDate: "",
        amount: "",
        reason: "",
        description: "",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "İade talebi gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>İade Talep Formu</CardTitle>
        <CardDescription>Lütfen tüm alanları eksiksiz doldurun</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Ad Soyad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Adınız ve soyadınız"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                E-posta <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">
                Sipariş/İşlem Numarası <span className="text-destructive">*</span>
              </Label>
              <Input
                id="orderNumber"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                required
                placeholder="ORD-12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">
                Ödeme Tarihi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="paymentDate"
                name="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Ödeme Tutarı (TL) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                İade Nedeni <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.reason}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, reason: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Neden seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service-not-received">Hizmet alınamadı</SelectItem>
                  <SelectItem value="technical-issues">Teknik sorunlar</SelectItem>
                  <SelectItem value="not-satisfied">Memnun kalmadım</SelectItem>
                  <SelectItem value="wrong-payment">Yanlış ödeme</SelectItem>
                  <SelectItem value="duplicate-payment">Çift ödeme</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Açıklama <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="İade talebinizle ilgili detaylı açıklama yazın..."
              rows={5}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-neon-blue to-neon-cyan hover:from-neon-cyan hover:to-neon-blue"
          >
            {isSubmitting ? "Gönderiliyor..." : "İade Talebini Gönder"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
