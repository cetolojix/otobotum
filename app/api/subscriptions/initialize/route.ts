// Initialize a subscription for a user
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { iyzicoSubscriptionClient } from "@/lib/iyzico/subscription-client"

export async function POST(request: NextRequest) {
  try {
    const { packageId, billingCycle } = await request.json()

    console.log("[v0] Initialize subscription request:", { packageId, billingCycle })

    if (!packageId || !billingCycle) {
      return NextResponse.json({ error: "Package ID and billing cycle are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      console.log("[v0] Profile not found for user:", user.id)
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from("packages")
      .select("*")
      .eq("id", packageId)
      .single()

    if (packageError || !packageData) {
      console.log("[v0] Package not found:", packageId, packageError)
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    console.log("[v0] Package data:", {
      name: packageData.name,
      hasMonthlyPlan: !!packageData.iyzico_monthly_plan_reference_code,
      hasYearlyPlan: !!packageData.iyzico_yearly_plan_reference_code,
    })

    // Get the appropriate pricing plan reference code
    const pricingPlanReferenceCode =
      billingCycle === "yearly"
        ? packageData.iyzico_yearly_plan_reference_code
        : packageData.iyzico_monthly_plan_reference_code

    if (!pricingPlanReferenceCode) {
      console.log("[v0] Pricing plan not configured for package:", packageData.name, "cycle:", billingCycle)
      return NextResponse.json(
        {
          error: "Pricing plan not configured. Please run iyzico setup first.",
          needsSetup: true,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Initializing subscription with plan:", pricingPlanReferenceCode)

    // Initialize subscription with iyzico
    const subscriptionResponse = await iyzicoSubscriptionClient.initializeSubscription({
      pricingPlanReferenceCode,
      subscriptionInitialStatus: "PENDING",
      customer: {
        name: profile.full_name?.split(" ")[0] || "Ad",
        surname: profile.full_name?.split(" ").slice(1).join(" ") || "Soyad",
        identityNumber: "11111111111", // Should be collected from user
        email: profile.email || user.email || "",
        gsmNumber: profile.phone || "+905555555555",
        billingAddress: {
          contactName: profile.full_name || "Ad Soyad",
          city: profile.city || "Istanbul",
          district: "Kadıköy",
          country: "Turkey",
          address: profile.address || "Adres bilgisi",
        },
        shippingAddress: {
          contactName: profile.full_name || "Ad Soyad",
          city: profile.city || "Istanbul",
          district: "Kadıköy",
          country: "Turkey",
          address: profile.address || "Adres bilgisi",
        },
      },
    })

    console.log("[v0] iyzico subscription response status:", subscriptionResponse.status)

    if (subscriptionResponse.status !== "success") {
      console.error("[v0] iyzico subscription error:", subscriptionResponse)
      return NextResponse.json(
        {
          error: subscriptionResponse.errorMessage || "Subscription initialization failed",
          iyzicoError: subscriptionResponse.errorCode,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Subscription initialized successfully:", subscriptionResponse.subscriptionReferenceCode)

    // Save subscription to database
    const { error: subscriptionError } = await supabase.from("user_subscriptions").insert({
      user_id: user.id,
      package_id: packageId,
      iyzico_subscription_reference_code: subscriptionResponse.subscriptionReferenceCode,
      iyzico_customer_reference_code: subscriptionResponse.customerReferenceCode,
      status: "trial", // Will be updated by webhook
      billing_cycle: billingCycle,
      is_trial: true,
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

    if (subscriptionError) {
      console.error("[v0] Error saving subscription:", subscriptionError)
    }

    // Return checkout form HTML
    return NextResponse.json({
      success: true,
      checkoutFormContent: subscriptionResponse.checkoutFormContent,
      subscriptionReferenceCode: subscriptionResponse.subscriptionReferenceCode,
    })
  } catch (error) {
    console.error("[v0] Error initializing subscription:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
