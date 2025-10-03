import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const profile = await getUserProfile(user.id)
    if (profile?.role === "admin") {
      return NextResponse.json({
        subscription: { status: "active", package_id: null },
        trial: null,
        isInTrial: false,
        isAdmin: true,
      })
    }

    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (subError) {
      console.error("[v0] Error fetching subscription:", subError)
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
    }

    const { data: trial } = await supabase.from("trial_periods").select("*").eq("user_id", user.id).maybeSingle()

    // Check if user is in trial
    const isInTrial = trial && new Date(trial.trial_end_date) > new Date() && !trial.is_trial_used

    return NextResponse.json({
      subscription: subscription || null,
      trial: trial || null,
      isInTrial,
    })
  } catch (error) {
    console.error("[v0] Error in subscription status API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
