import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ connected: false }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("instagram_connections")
      .select("instagram_username")
      .eq("user_id", user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
      connected: true,
      username: data.instagram_username,
    })
  } catch (error) {
    console.error("[Instagram Status] Error:", error)
    return NextResponse.json({ connected: false }, { status: 500 })
  }
}
