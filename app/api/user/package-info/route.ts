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
        const { error: packageError } = await supabase.from("user_packages").upsert(
          {
            user_id: user.id,
            package_id: basicPackage.id,
            is_active: true,
          },
          {
            onConflict: "user_id,package_id",
          },
        )

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
            const { data: instances } = await supabase.from("whatsapp_instances").select("id").eq("created_by", user.id)

            const currentInstances = instances?.length || 0
            const maxInstances = retryPackageInfo.packages?.max_instances || 1
            const remainingInstances = Math.max(0, maxInstances - currentInstances)

            return NextResponse.json({
              packageInfo: {
                user_id: retryPackageInfo.user_id,
                package_name: retryPackageInfo.packages?.name || "basic",
                display_name_tr: retryPackageInfo.packages?.display_name_tr || "Temel",
                display_name_en: retryPackageInfo.packages?.display_name_en || "Basic",
                max_instances: maxInstances,
                current_instances: currentInstances,
                remaining_instances: remainingInstances,
                subscription_status: retryPackageInfo.subscription_status || "active",
              },
            })
          }
        }
      }

      return NextResponse.json({ error: "Failed to assign basic package" }, { status: 500 })
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
