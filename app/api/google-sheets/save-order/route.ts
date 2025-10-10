import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { instanceName, customerPhone, customerName, orderDetails, orderAmount } = await request.json()

    if (!instanceName || !customerPhone || !orderDetails) {
      return NextResponse.json(
        { error: "Instance name, customer phone, and order details are required" },
        { status: 400 },
      )
    }

    console.log("[v0] Saving order:", {
      instanceName,
      customerPhone,
      orderDetails: orderDetails.substring(0, 100),
    })

    const supabase = await createClient()

    // Parse order details to extract amount if not provided
    let finalAmount = orderAmount
    if (!finalAmount && orderDetails.includes("TL")) {
      const amountMatch = orderDetails.match(/(\d+(?:\.\d+)?)\s*TL/)
      if (amountMatch) {
        finalAmount = Number.parseFloat(amountMatch[1])
      }
    }

    // Save order directly to database
    const { data: order, error: orderError } = await supabase
      .from("google_sheets_orders")
      .insert({
        instance_name: instanceName,
        customer_phone: customerPhone,
        customer_name: customerName || null,
        order_details: orderDetails,
        order_amount: finalAmount || null,
        synced_to_sheets: false,
      })
      .select()
      .single()

    if (orderError) {
      console.error("[v0] Error saving order to database:", orderError)
      throw orderError
    }

    console.log("[v0] Order saved to database:", order.id)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order saved successfully",
    })
  } catch (error) {
    console.error("[v0] Error saving order:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save order",
      },
      { status: 500 },
    )
  }
}
