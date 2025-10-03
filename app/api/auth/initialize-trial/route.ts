import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { initializeTrialForNewUser } from "@/lib/subscription-utils"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Initialize trial for user
    const trial = await initializeTrialForNewUser(user.id)

    if (!trial) {
      return NextResponse.json({ error: "Failed to initialize trial" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      trial,
      message: "Trial period activated",
    })
  } catch (error) {
    console.error("[v0] Error initializing trial:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
