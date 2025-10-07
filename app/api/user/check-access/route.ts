import { type NextRequest, NextResponse } from "next/server"
import { checkSubscriptionAccess } from "@/lib/subscription-utils"

export async function GET(request: NextRequest) {
  try {
    const status = await checkSubscriptionAccess()

    return NextResponse.json(status)
  } catch (error) {
    console.error("[v0] Error checking access:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      {
        error: errorMessage,
        hasAccess: false,
        isInTrial: false,
        trialDaysLeft: 0,
        subscription: null,
        needsUpgrade: true,
      },
      { status: 500 },
    )
  }
}
