import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: instance, error } = await supabase
      .from("whatsapp_instances")
      .select("website_url")
      .eq("name", instanceName)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error fetching website URL:", error)
      return NextResponse.json({ error: "Failed to fetch website URL" }, { status: 500 })
    }

    return NextResponse.json({ websiteUrl: instance?.website_url || "" })
  } catch (error) {
    console.error("[v0] Error in website-url GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instanceName, websiteUrl } = body

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { error } = await supabase
      .from("whatsapp_instances")
      .update({ website_url: websiteUrl || null })
      .eq("name", instanceName)

    if (error) {
      console.error("[v0] Error saving website URL:", error)
      return NextResponse.json({ error: "Failed to save website URL" }, { status: 500 })
    }

    return NextResponse.json({ success: true, websiteUrl })
  } catch (error) {
    console.error("[v0] Error in website-url POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
