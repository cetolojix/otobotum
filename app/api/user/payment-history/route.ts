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

    // Get payment transactions
    const { data: transactions, error: transError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (transError) {
      console.error("[v0] Error fetching transactions:", transError)
      return NextResponse.json({ error: "Failed to fetch payment history" }, { status: 500 })
    }

    return NextResponse.json({
      transactions: transactions || [],
    })
  } catch (error) {
    console.error("[v0] Error in payment history API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
