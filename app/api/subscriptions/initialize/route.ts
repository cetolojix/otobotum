// Initialize a subscription for a user
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  console.log("[v0] === Subscription Initialize API Called ===")

  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { packageId, billingCycle } = body

    console.log("[v0] Initialize subscription request:", { packageId, billingCycle })

    if (!packageId || !billingCycle) {
      return NextResponse.json({ error: "Package ID and billing cycle are required" }, { status: 400 })
    }

    let supabase
    try {
      supabase = await createClient()
      console.log("[v0] Supabase client created successfully")
    } catch (supabaseError) {
      console.error("[v0] Failed to create Supabase client:", supabaseError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: supabaseError instanceof Error ? supabaseError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

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

    console.log("[v0] Would initialize subscription with plan:", pricingPlanReferenceCode)

    return NextResponse.json({
      success: true,
      message: "API route is working! iyzico integration will be added next.",
      pricingPlanReferenceCode,
      packageName: packageData.name,
    })
  } catch (error) {
    console.error("[v0] Error initializing subscription:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
