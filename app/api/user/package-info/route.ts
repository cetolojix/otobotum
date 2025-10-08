import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { debugLog } from "@/lib/debug"

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

    const { data: packageInfo, error } = await supabase
      .from("user_packages")
      .select(`
        *,
        packages:package_id (
          id,
          name,
          display_name_tr,
          display_name_en,
          max_instances,
          price_monthly,
          price_yearly,
          features
        )
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()

    if (error) {
      debugLog("[v0] Error fetching user package info:", error)
      return NextResponse.json({ error: "Failed to fetch package information" }, { status: 500 })
    }

    // Paket yoksa null döndürülüyor
    if (!packageInfo) {
      debugLog("[v0] No package info found for user:", user.id)

      return NextResponse.json({
        packageInfo: null,
      })
    }

    const { data: instances } = await supabase.from("whatsapp_instances").select("id").eq("created_by", user.id)

    const currentInstances = instances?.length || 0
    const maxInstances = packageInfo.packages?.max_instances || 1
    const remainingInstances = Math.max(0, maxInstances - currentInstances)

    return NextResponse.json({
      packageInfo: {
        user_id: packageInfo.user_id,
        package_name: packageInfo.packages?.name || "basic",
        display_name_tr: packageInfo.packages?.display_name_tr || "Temel",
        display_name_en: packageInfo.packages?.display_name_en || "Basic",
        max_instances: maxInstances,
        current_instances: currentInstances,
        remaining_instances: remainingInstances,
        subscription_status: packageInfo.subscription_status || "active",
      },
    })
  } catch (error) {
    debugLog("[v0] Error in user package info API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
