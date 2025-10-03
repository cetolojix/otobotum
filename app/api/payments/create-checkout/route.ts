import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { iyzicoClient } from "@/lib/iyzico/client"

export async function POST(request: NextRequest) {
  try {
    const { packageId, billingCycle } = await request.json()

    if (!packageId || !billingCycle) {
      return NextResponse.json({ error: "Package ID and billing cycle are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from("packages")
      .select("*")
      .eq("id", packageId)
      .single()

    if (packageError || !packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // Calculate price based on billing cycle
    const price = billingCycle === "yearly" ? packageData.price_yearly : packageData.price_monthly
    const paidPrice = price // Can add discounts here

    // Generate conversation ID
    const conversationId = `${user.id}-${Date.now()}`

    // Get user IP (for iyzico requirement)
    const userIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"

    // Create payment request
    const paymentRequest = {
      locale: "tr",
      conversationId,
      price: price.toString(),
      paidPrice: paidPrice.toString(),
      currency: "TRY",
      basketId: `basket-${Date.now()}`,
      paymentGroup: "SUBSCRIPTION",
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/callback`,
      buyer: {
        id: user.id,
        name: profile.full_name?.split(" ")[0] || "Ad",
        surname: profile.full_name?.split(" ").slice(1).join(" ") || "Soyad",
        email: profile.email || user.email || "",
        identityNumber: "11111111111", // This should be collected from user
        registrationAddress: profile.address || "Adres bilgisi",
        city: profile.city || "Istanbul",
        country: "Turkey",
        ip: userIp,
      },
      shippingAddress: {
        contactName: profile.full_name || "Ad Soyad",
        city: profile.city || "Istanbul",
        country: "Turkey",
        address: profile.address || "Adres bilgisi",
      },
      billingAddress: {
        contactName: profile.full_name || "Ad Soyad",
        city: profile.city || "Istanbul",
        country: "Turkey",
        address: profile.address || "Adres bilgisi",
      },
      basketItems: [
        {
          id: packageData.id,
          name: `${packageData.display_name_tr} - ${billingCycle === "yearly" ? "Yıllık" : "Aylık"} Abonelik`,
          category1: "Subscription",
          itemType: "VIRTUAL",
          price: price.toString(),
        },
      ],
    }

    // Create checkout form with iyzico
    const iyzicoResponse = await iyzicoClient.createCheckoutForm(paymentRequest)

    if (iyzicoResponse.status !== "success") {
      console.error("[v0] iyzico error:", iyzicoResponse)
      return NextResponse.json(
        {
          error: iyzicoResponse.errorMessage || "Payment initialization failed",
        },
        { status: 400 },
      )
    }

    // Save transaction to database
    const { error: transactionError } = await supabase.from("payment_transactions").insert({
      user_id: user.id,
      package_id: packageId,
      conversation_id: conversationId,
      payment_id: iyzicoResponse.paymentId,
      amount: paidPrice,
      currency: "TRY",
      billing_cycle: billingCycle,
      payment_status: "pending",
      iyzico_response: iyzicoResponse,
    })

    if (transactionError) {
      console.error("[v0] Error saving transaction:", transactionError)
    }

    return NextResponse.json({
      success: true,
      paymentPageUrl: iyzicoResponse.paymentPageUrl,
      token: iyzicoResponse.paymentId,
    })
  } catch (error) {
    console.error("[v0] Error creating checkout:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
