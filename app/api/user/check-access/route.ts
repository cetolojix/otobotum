import { type NextRequest, NextResponse } from "next/server"
import { checkSubscriptionAccess } from "@/lib/subscription-utils"

export async function GET(request: NextRequest) {
  try {
    const status = await checkSubscriptionAccess()

    return NextResponse.json(status)
  } catch (error) {
    console.error("[v0] Error checking access:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
