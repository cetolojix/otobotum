import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { packageName } = await request.json()

    if (!packageName) {
      return NextResponse.json({ error: "Package name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the target package
    const { data: targetPackage, error: packageError } = await supabase
      .from("packages")
      .select("*")
      .eq("name", packageName)
      .eq("is_active", true)
      .single()

    if (packageError || !targetPackage) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 })
    }

    const { data: existingSubscription } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1) // Default to 1 month subscription

    const subscriptionData = {
      user_id: user.id,
      package_id: targetPackage.id,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false, // false means auto-renew is enabled
    }

    let updateError
    if (existingSubscription) {
      // Update existing subscription
      const { error } = await supabase
        .from("user_subscriptions")
        .update(subscriptionData)
        .eq("id", existingSubscription.id)
      updateError = error
    } else {
      // Insert new subscription
      const { error } = await supabase.from("user_subscriptions").insert(subscriptionData)
      updateError = error
    }

    if (updateError) {
      console.error("[v0] Error updating user subscription:", updateError)
      return NextResponse.json({ error: "Failed to upgrade package" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Package upgraded successfully",
      package: targetPackage,
    })
  } catch (error) {
    console.error("[v0] Error in upgrade package API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
