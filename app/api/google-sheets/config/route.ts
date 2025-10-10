import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: config, error } = await supabase
      .from("google_sheets_config")
      .select("*")
      .eq("user_id", user.id)
      .eq("instance_name", instanceName)
      .maybeSingle()

    if (error) {
      throw error
    }

    return NextResponse.json({ config: config || null })
  } catch (error) {
    console.error("[v0] Error fetching Google Sheets config:", error)
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instanceName, spreadsheet_id, sheet_name, service_account_email, is_active } = body

    if (!instanceName || !spreadsheet_id) {
      return NextResponse.json({ error: "Instance name and spreadsheet ID are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("google_sheets_config")
      .upsert(
        {
          user_id: user.id,
          instance_name: instanceName,
          spreadsheet_id: spreadsheet_id.trim(),
          sheet_name: sheet_name || "Siparişler",
          service_account_email: service_account_email || null,
          is_active: is_active !== false,
        },
        {
          onConflict: "user_id,instance_name",
        },
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, config: data })
  } catch (error) {
    console.error("[v0] Error saving Google Sheets config:", error)
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 })
  }
}
