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

    if (!packageInfo) {
      debugLog("[v0] No package info found, assigning basic package to user:", user.id)

      // Get basic package
      const { data: basicPackage } = await supabase.from("packages").select("id").eq("name", "basic").single()

      if (basicPackage) {
        // Create user package entry
        const { error: packageError } = await supabase.from("user_packages").insert({
          user_id: user.id,
          package_id: basicPackage.id,
          is_active: true,
        })

        if (!packageError) {
          // Retry getting package info
          const { data: retryPackageInfo, error: retryError } = await supabase
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
            .single()

          if (!retryError && retryPackageInfo) {
            return NextResponse.json({ packageInfo: retryPackageInfo })
          }
        }
      }

      return NextResponse.json({ error: "Failed to assign basic package" }, { status: 500 })
    }

    return NextResponse.json({ packageInfo })
  } catch (error) {
    debugLog("[v0] Error in user package info API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
