import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Iyzipay from "iyzipay"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting iyzico setup...")

    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "iyzico API credentials not configured",
        },
        { status: 400 },
      )
    }

    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY,
      uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
    })

    const supabase = await createClient()

    const { data: packages, error: packagesError } = await supabase.from("packages").select("*").limit(1)

    if (packagesError) {
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

        const productRequest = {
          locale: Iyzipay.LOCALE.TR,
          conversationId: `product-${pkg.id}`,
          name: pkg.name,
          description: pkg.description || `${pkg.name} paketi`,
        }

        // Create product using official SDK
        const productResult = await new Promise((resolve, reject) => {
          iyzipay.subscriptionProduct.create(productRequest, (err: any, result: any) => {
            if (err) reject(err)
            else resolve(result)
          })
        })

        console.log("[v0] Product created:", productResult)

        results.push({
          package: pkg.name,
          success: true,
          data: productResult,
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
