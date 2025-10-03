// API endpoint to create iyzico products and pricing plans for all packages
// This should be run once during initial setup or when adding new packages
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { iyzicoSubscriptionClient } from "@/lib/iyzico/subscription-client"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin access (you should implement proper admin check)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get all packages that don't have iyzico references yet
    const { data: packages, error: packagesError } = await supabase
      .from("packages")
      .select("*")
      .or("iyzico_product_reference_code.is.null,iyzico_monthly_plan_reference_code.is.null")

    if (packagesError) {
      return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
    }

    const results = []

    for (const pkg of packages || []) {
      try {
        let productReferenceCode = pkg.iyzico_product_reference_code

        // Create product if it doesn't exist
        if (!productReferenceCode) {
          const productResponse = await iyzicoSubscriptionClient.createProduct({
            name: pkg.display_name_tr,
            description: pkg.description_tr || pkg.display_name_tr,
          })

          if (productResponse.status === "success" && productResponse.productReferenceCode) {
            productReferenceCode = productResponse.productReferenceCode

            // Update package with product reference
            await supabase
              .from("packages")
              .update({ iyzico_product_reference_code: productReferenceCode })
              .eq("id", pkg.id)
          } else {
            results.push({
              package: pkg.name,
              error: productResponse.errorMessage || "Failed to create product",
            })
            continue
          }
        }

        // Create monthly plan if it doesn't exist
        if (!pkg.iyzico_monthly_plan_reference_code && productReferenceCode) {
          const monthlyPlanResponse = await iyzicoSubscriptionClient.createPricingPlan({
            productReferenceCode,
            name: `${pkg.display_name_tr} - Aylık`,
            price: pkg.price_monthly.toString(),
            currencyCode: "TRY",
            paymentInterval: "MONTHLY",
            paymentIntervalCount: 1,
            planPaymentType: "RECURRING",
            trialPeriodDays: 7,
          })

          if (monthlyPlanResponse.status === "success" && monthlyPlanResponse.pricingPlanReferenceCode) {
            await supabase
              .from("packages")
              .update({ iyzico_monthly_plan_reference_code: monthlyPlanResponse.pricingPlanReferenceCode })
              .eq("id", pkg.id)
          }
        }

        // Create yearly plan if it doesn't exist
        if (!pkg.iyzico_yearly_plan_reference_code && productReferenceCode) {
          const yearlyPlanResponse = await iyzicoSubscriptionClient.createPricingPlan({
            productReferenceCode,
            name: `${pkg.display_name_tr} - Yıllık`,
            price: pkg.price_yearly.toString(),
            currencyCode: "TRY",
            paymentInterval: "YEARLY",
            paymentIntervalCount: 1,
            planPaymentType: "RECURRING",
            trialPeriodDays: 7,
          })

          if (yearlyPlanResponse.status === "success" && yearlyPlanResponse.pricingPlanReferenceCode) {
            await supabase
              .from("packages")
              .update({ iyzico_yearly_plan_reference_code: yearlyPlanResponse.pricingPlanReferenceCode })
              .eq("id", pkg.id)
          }
        }

        results.push({
          package: pkg.name,
          success: true,
          productReferenceCode,
        })
      } catch (error) {
        results.push({
          package: pkg.name,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("[v0] Error setting up iyzico products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
