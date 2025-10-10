import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get instance_name from query params
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance_name")

    if (!instanceName) {
      return NextResponse.json({ error: "instance_name is required" }, { status: 400 })
    }

    // Fetch orders for this instance
    const { data: orders, error: ordersError } = await supabase
      .from("google_sheets_orders")
      .select("*")
      .eq("instance_name", instanceName)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("[v0] Failed to fetch orders:", ordersError)
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
        const orderDate = new Date(order.order_date)
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
    console.error("[v0] Orders API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
