import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")

    if (!name) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log("[v0] Fetching instance with name:", name)

    const { data: instance, error } = await supabase
      .from("whatsapp_instances")
      .select("id, name, status")
      .eq("name", name)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error fetching instance:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!instance) {
      console.log("[v0] No instance found for name:", name)
      return NextResponse.json({ instance: null })
    }

    console.log("[v0] Instance found:", instance)
    return NextResponse.json({ instance })
  } catch (error) {
    console.error("[v0] Error in GET /api/instances:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
