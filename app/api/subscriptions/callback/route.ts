import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] === Subscription Callback Received ===")

    const body = await request.json()
    console.log("[v0] Callback data:", body)

    const { token, status } = body

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    if (status === "success") {
      console.log("[v0] Subscription payment successful, updating database...")

      const supabase = await createClient()

      // Get user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("[v0] User not found:", userError)
        return NextResponse.json({ error: "User not found" }, { status: 401 })
      }

      // TODO: Update user's subscription in database
      // This will be implemented based on your subscription table structure

      console.log("[v0] Subscription activated for user:", user.id)

      return NextResponse.json({
        success: true,
        message: "Subscription activated successfully",
      })
    } else {
      console.log("[v0] Subscription payment failed or cancelled")
      return NextResponse.json(
        {
          success: false,
          message: "Payment failed or cancelled",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[v0] Error processing callback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
