"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  product_name: string
  product_url: string
  description: string | null
  created_at: string
}

interface ProductManagerProps {
  instanceName: string // Changed from instanceId to instanceName
}

export function ProductManager({ instanceName }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    productName: "",
    productUrl: "",
    description: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [instanceName]) // Changed dependency from instanceId to instanceName

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/products?instanceName=${encodeURIComponent(instanceName)}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products || [])
      } else {
        toast({
          title: "Hata",
          description: data.error || "Ürünler yüklenemedi",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching products:", error)
      toast({
        title: "Hata",
        description: "Ürünler yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Product form submitted:", { instanceName, formData, editingProduct })

    if (!formData.productName || !formData.productUrl) {
      toast({
        title: "Hata",
        description: "Ürün adı ve URL zorunludur",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingProduct ? "/api/products" : "/api/products"
      const method = editingProduct ? "PUT" : "POST"
      const body = editingProduct
        ? {
            id: editingProduct.id,
            productName: formData.productName,
            productUrl: formData.productUrl,
            description: formData.description,
          }
        : {
            instanceName,
            productName: formData.productName,
            productUrl: formData.productUrl,
            description: formData.description,
          }

      console.log("[v0] Sending product request:", { url, method, body })

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      console.log("[v0] Product API response:", { status: response.status, data })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: editingProduct ? "Ürün güncellendi" : "Ürün eklendi",
        })
        setIsDialogOpen(false)
        setEditingProduct(null)
        setFormData({ productName: "", productUrl: "", description: "" })
        fetchProducts()
      } else {
        toast({
          title: "Hata",
          description: data.error || "İşlem başarısız",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast({
        title: "Hata",
        description: "Ürün kaydedilirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      productName: product.product_name,
      productUrl: product.product_url,
      description: product.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      return
    }

    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Ürün silindi",
        })
        fetchProducts()
      } else {
        const data = await response.json()
        toast({
          title: "Hata",
          description: data.error || "Ürün silinemedi",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast({
        title: "Hata",
        description: "Ürün silinirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    setFormData({ productName: "", productUrl: "", description: "" })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ürün Yönetimi</CardTitle>
            <CardDescription>Müşterilere gösterilecek ürünleri ekleyin ve yönetin</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ürün Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</DialogTitle>
                <DialogDescription>
                  Ürün bilgilerini girin. AI agent müşteri bu ürünü sorduğunda otomatik olarak bilgi verecek.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Ürün Adı *</Label>
                    <Input
                      id="productName"
                      placeholder="Örn: iPhone 15 Pro"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productUrl">Ürün URL *</Label>
                    <Input
                      id="productUrl"
                      type="url"
                      placeholder="https://example.com/urun/iphone-15-pro"
                      value={formData.productUrl}
                      onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                    <Textarea
                      id="description"
                      placeholder="Ürün hakkında kısa açıklama"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    İptal
                  </Button>
                  <Button type="submit">{editingProduct ? "Güncelle" : "Ekle"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz ürün eklenmemiş. Başlamak için yukarıdaki butona tıklayın.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{product.product_name}</h3>
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    {product.product_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {product.description && <p className="text-sm text-muted-foreground mt-2">{product.description}</p>}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
