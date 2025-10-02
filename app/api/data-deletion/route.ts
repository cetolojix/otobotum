import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, reason, description } = body

    // Validate required fields
    if (!fullName || !email) {
      return NextResponse.json({ error: "Ad Soyad ve E-posta zorunludur" }, { status: 400 })
    }

    const supabase = await createClient()

    // Store the data deletion request in the database
    const { error: insertError } = await supabase.from("data_deletion_requests").insert({
      full_name: fullName,
      email: email,
      phone: phone || null,
      reason: reason || null,
      description: description || null,
      status: "pending",
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error inserting data deletion request:", insertError)
      return NextResponse.json({ error: "Talep kaydedilemedi" }, { status: 500 })
    }

    // TODO: Send email notification to admin and user
    // You can integrate with an email service here

    return NextResponse.json({ success: true, message: "Talebiniz başarıyla alındı" })
  } catch (error) {
    console.error("Data deletion request error:", error)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}
