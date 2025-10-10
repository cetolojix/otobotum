"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, TrendingUp, Calendar, Phone, Package } from "lucide-react"
import { debugLog } from "@/lib/debug"

interface Order {
  id: string
  instance_name: string
  customer_phone: string
  customer_name: string | null
  order_details: string
  order_amount: number
  order_date: string
  created_at: string
}

interface OrderStats {
  totalOrders: number
  totalAmount: number
  todayOrders: number
}

interface OrdersManagerProps {
  instanceName: string
}

export function OrdersManager({ instanceName }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({ totalOrders: 0, totalAmount: 0, todayOrders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [instanceName])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders?instance_name=${encodeURIComponent(instanceName)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()
      setOrders(data.orders)
      setStats(data.stats)
    } catch (error) {
      debugLog("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto"></div>
          <p className="text-muted-foreground">Siparişler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hologram-card border-0 backdrop-blur-sm shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card className="hologram-card border-0 backdrop-blur-sm shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card className="hologram-card border-0 backdrop-blur-sm shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Siparişler</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">Son 24 saat</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="hologram-card border-0 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold neon-text">Sipariş Geçmişi</CardTitle>
          <CardDescription>Tüm siparişlerinizi buradan görüntüleyebilirsiniz</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Package className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
              <div>
                <p className="text-lg font-medium text-muted-foreground">Henüz sipariş yok</p>
                <p className="text-sm text-muted-foreground">Müşterileriniz sipariş verdiğinde burada görünecek</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="hologram-card border-0 bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-neon-cyan" />
                            <span className="font-medium">{order.customer_phone}</span>
                            {order.customer_name && (
                              <Badge variant="outline" className="text-xs">
                                {order.customer_name}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{order.order_details}</div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(order.order_date)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-neon-cyan">{formatCurrency(order.order_amount)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
