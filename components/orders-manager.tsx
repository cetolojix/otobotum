"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Calendar, DollarSign } from "lucide-react"

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
      const response = await fetch(`/api/orders?instance=${encodeURIComponent(instanceName)}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders)
        setStats(data.stats)
      } else {
        console.error("[v0] Failed to fetch orders:", data.error)
      }
    } catch (error) {
      console.error("[v0] Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card className="hologram-card border-0 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Siparişler yükleniyor...</div>
        </CardContent>
      </Card>
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Tüm siparişler</p>
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
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz sipariş bulunmuyor</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border border-border/50 bg-background/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {order.customer_phone}
                            </Badge>
                            {order.customer_name && <span className="text-sm font-medium">{order.customer_name}</span>}
                          </div>
                          <p className="text-sm text-muted-foreground">{order.order_details}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatDate(order.created_at)}</span>
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
