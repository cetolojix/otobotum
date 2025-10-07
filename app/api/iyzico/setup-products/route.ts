import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com"

async function generateAuthString(apiKey: string, secretKey: string, randomString: string, body: string) {
  const crypto = await import("crypto")

  const authHeader = `IYZWSv2 ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`

  // Generate HMAC-SHA256 signature
  const hmac = crypto.createHmac("sha256", secretKey)
  hmac.update(randomString + body)
  const signature = hmac.digest("hex")

  return {
    authorization: authHeader,
    randomString,
    signature,
  }
}

async function makeIyzicoRequest(endpoint: string, body: any) {
  const apiKey = process.env.IYZICO_API_KEY!
  const secretKey = process.env.IYZICO_SECRET_KEY!

  const randomString = Math.random().toString(36).substring(2, 15)
  const bodyString = JSON.stringify(body)

  const auth = await generateAuthString(apiKey, secretKey, randomString, bodyString)

  console.log("[v0] Making iyzico request to:", `${IYZICO_BASE_URL}${endpoint}`)

  const response = await fetch(`${IYZICO_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth.authorization,
      "x-iyzi-rnd": auth.randomString,
      "x-iyzi-signature": auth.signature,
    },
    body: bodyString,
  })

  const result = await response.json()
  console.log("[v0] Iyzico response:", result)
  return result
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] === Starting iyzico setup ===")

    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
      console.log("[v0] Missing iyzico credentials")
      return NextResponse.json(
        {
          success: false,
          error: "iyzico API credentials not configured",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Creating Supabase client...")
    const supabase = await createClient()

    console.log("[v0] Fetching packages from database...")
    const { data: packages, error: packagesError } = await supabase
      .from("packages")
      .select("*")
      .order("price_monthly", { ascending: true })

    if (packagesError) {
      console.error("[v0] Error fetching packages:", packagesError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch packages from database",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Processing", packages?.length || 0, "packages")

    const results = []

    for (const pkg of packages || []) {
      try {
        console.log(`[v0] Processing package: ${pkg.name}`)

        if (pkg.price_monthly === 0) {
          console.log(`[v0] Skipping free package: ${pkg.name}`)
          results.push({
            package: pkg.name,
            success: true,
            message: "Free package - no iyzico setup needed",
          })
          continue
        }

        console.log(`[v0] Creating product for: ${pkg.name}`)
        const productResult = await makeIyzicoRequest("/v2/subscription/products", {
          locale: "tr",
          name: pkg.name,
          description: pkg.display_name_tr || `${pkg.name} paketi`,
          conversationId: `product-${pkg.id}`,
        })

        if (productResult.status !== "success" || !productResult.data?.referenceCode) {
          throw new Error(productResult.errorMessage || "Failed to create product")
        }

        const productReferenceCode = productResult.data.referenceCode
        console.log(`[v0] Product created with code: ${productReferenceCode}`)

        let monthlyPlanCode = null
        if (pkg.price_monthly > 0) {
          console.log(`[v0] Creating monthly plan for: ${pkg.name}`)
          const monthlyPlanResult = await makeIyzicoRequest("/v2/subscription/pricing-plans", {
            locale: "tr",
            productReferenceCode,
            name: `${pkg.name}-monthly`,
            price: (pkg.price_monthly / 100).toFixed(2),
            currencyCode: "TRY",
            paymentInterval: "MONTHLY",
            paymentIntervalCount: 1,
            planPaymentType: "RECURRING",
            conversationId: `plan-monthly-${pkg.id}`,
          })

          if (monthlyPlanResult.status !== "success" || !monthlyPlanResult.data?.referenceCode) {
            throw new Error(monthlyPlanResult.errorMessage || "Failed to create monthly plan")
          }

          monthlyPlanCode = monthlyPlanResult.data.referenceCode
          console.log(`[v0] Monthly plan created with code: ${monthlyPlanCode}`)
        }

        let yearlyPlanCode = null
        if (pkg.price_yearly > 0) {
          console.log(`[v0] Creating yearly plan for: ${pkg.name}`)
          const yearlyPlanResult = await makeIyzicoRequest("/v2/subscription/pricing-plans", {
            locale: "tr",
            productReferenceCode,
            name: `${pkg.name}-yearly`,
            price: (pkg.price_yearly / 100).toFixed(2),
            currencyCode: "TRY",
            paymentInterval: "YEARLY",
            paymentIntervalCount: 1,
            planPaymentType: "RECURRING",
            conversationId: `plan-yearly-${pkg.id}`,
          })

          if (yearlyPlanResult.status !== "success" || !yearlyPlanResult.data?.referenceCode) {
            throw new Error(yearlyPlanResult.errorMessage || "Failed to create yearly plan")
          }

          yearlyPlanCode = yearlyPlanResult.data.referenceCode
          console.log(`[v0] Yearly plan created with code: ${yearlyPlanCode}`)
        }

        console.log(`[v0] Updating package in database: ${pkg.name}`)
        const { error: updateError } = await supabase
          .from("packages")
          .update({
            iyzico_product_code: productReferenceCode,
            iyzico_monthly_plan_code: monthlyPlanCode,
            iyzico_yearly_plan_code: yearlyPlanCode,
          })
          .eq("id", pkg.id)

        if (updateError) {
          console.error("[v0] Error updating package:", updateError)
          throw new Error("Failed to update package with iyzico codes")
        }

        results.push({
          package: pkg.name,
          success: true,
          productCode: productReferenceCode,
          monthlyPlanCode,
          yearlyPlanCode,
        })
      } catch (error) {
        console.error("[v0] Error processing package:", error)
        results.push({
          package: pkg.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    console.log("[v0] Setup complete. Results:", results)

    return NextResponse.json({
      success: true,
      message: "iyzico setup completed",
      results,
    })
  } catch (error) {
    console.error("[v0] Fatal error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
