import { type NextRequest, NextResponse } from "next/server"
import { checkAndExpireSubscriptions } from "@/lib/subscription-utils"

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// to check and expire subscriptions daily

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const expiredCount = await checkAndExpireSubscriptions()

    return NextResponse.json({
      success: true,
      expiredCount,
      message: `Checked subscriptions, expired ${expiredCount}`,
    })
  } catch (error) {
    console.error("[v0] Error in subscription check cron:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
