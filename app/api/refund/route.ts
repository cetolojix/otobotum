import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, orderNumber, paymentDate, amount, reason, description } = body

    // Validate required fields
    if (!fullName || !email || !orderNumber || !paymentDate || !amount || !reason || !description) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur" }, { status: 400 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from("refund_requests")
      .insert([
        {
          full_name: fullName,
          email,
          order_number: orderNumber,
          payment_date: paymentDate,
          amount: Number.parseFloat(amount),
          reason,
          description,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "İade talebi kaydedilemedi" }, { status: 500 })
    }

    return NextResponse.json({ message: "İade talebi başarıyla kaydedildi", data }, { status: 200 })
  } catch (error) {
    console.error("Error processing refund request:", error)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
