import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Get user subscription with package details
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        packages (
          id,
          name,
          display_name_tr,
          display_name_en,
          max_instances,
          price_monthly,
          price_yearly,
          features
        )
      `,
      )
      .eq("user_id", user.id)
      .single()

    if (subError && subError.code !== "PGRST116") {
      console.error("[v0] Error fetching subscription:", subError)
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
    }

    return NextResponse.json({
      subscription: subscription || null,
    })
  } catch (error) {
    console.error("[v0] Error in subscription details API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
