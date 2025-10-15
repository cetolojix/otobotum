import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instanceName")

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log("[v0] Fetching Chatwoot inbox for instance:", instanceName)

    const supabase = await createClient()

    if (!supabase) {
      console.error("[v0] Failed to create Supabase client")
      return NextResponse.json({ error: "Failed to create database client" }, { status: 500 })
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user) {
      console.error("[v0] No user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

    // Get inbox
    const { data: inbox, error } = await supabase
      .from("chatwoot_inboxes")
      .select("*")
      .eq("user_id", user.id)
      .eq("instance_name", instanceName)
      .maybeSingle()

    if (error) {
      console.error("[v0] Database error:", error)
      throw error
    }

    console.log("[v0] Inbox found:", !!inbox)

    return NextResponse.json({ inbox })
  } catch (error: any) {
    console.error("[v0] Failed to fetch Chatwoot inbox:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch inbox" }, { status: 500 })
  }
}
