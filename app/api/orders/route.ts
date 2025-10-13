import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get orders for this instance
    const { data: orders, error: ordersError } = await supabase
      .from("google_sheets_orders")
      .select("*")
      .eq("instance_name", instanceName)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("[v0] Error fetching orders:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // Calculate statistics
    const totalOrders = orders?.length || 0
    const totalAmount = orders?.reduce((sum, order) => sum + (Number(order.order_amount) || 0), 0) || 0

    // Get today's orders
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders =
      orders?.filter((order) => {
        const orderDate = new Date(order.created_at)
        return orderDate >= today
      }).length || 0

    return NextResponse.json({
      orders: orders || [],
      stats: {
        totalOrders,
        totalAmount,
        todayOrders,
      },
    })
  } catch (error) {
    console.error("[v0] Error in orders API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
