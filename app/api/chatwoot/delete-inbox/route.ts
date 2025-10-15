import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    const { instanceName } = await request.json()

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete inbox
    const { error } = await supabase
      .from("chatwoot_inboxes")
      .delete()
      .eq("user_id", user.id)
      .eq("instance_name", instanceName)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Failed to delete Chatwoot inbox:", error)
    return NextResponse.json({ error: error.message || "Failed to delete inbox" }, { status: 500 })
  }
}
