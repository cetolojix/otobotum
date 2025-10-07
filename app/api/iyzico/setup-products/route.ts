import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || "https://api.iyzipay.com"

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)

  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function generateRandomString(): Promise<string> {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function generateAuthHeader(
  apiKey: string,
  secretKey: string,
  uri: string,
  body: object,
  randomString: string,
): Promise<string> {
  const bodyString = JSON.stringify(body)
  const dataToSign = randomString + uri + bodyString

  const signatureHex = await hmacSha256(secretKey, dataToSign)

  const authorizationParams = [`apiKey:${apiKey}`, `randomKey:${randomString}`, `signature:${signatureHex}`].join("&")

  const base64Auth = btoa(authorizationParams)

  return `IYZWSv2 ${base64Auth}`
}

async function makeIyzicoRequest(endpoint: string, body: any) {
  const apiKey = process.env.IYZICO_API_KEY!
  const secretKey = process.env.IYZICO_SECRET_KEY!

  const randomString = await generateRandomString()
  const authHeader = await generateAuthHeader(apiKey, secretKey, endpoint, body, randomString)

  console.log("[v0] Making iyzico request to:", `${IYZICO_BASE_URL}${endpoint}`)
  console.log("[v0] Request body:", JSON.stringify(body, null, 2))

  const response = await fetch(`${IYZICO_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
      "x-iyzi-rnd": randomString,
      "x-iyzi-client-version": "iyzipay-node-2.0.64",
    },
    body: JSON.stringify(body),
  })

  const contentType = response.headers.get("content-type")
  console.log("[v0] Response status:", response.status, "Content-Type:", contentType)

  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text()
    console.error("[v0] Non-JSON response received:", text.substring(0, 500))
    throw new Error(`API returned non-JSON response (${response.status}): ${text.substring(0, 200)}`)
  }

  const result = await response.json()
  console.log("[v0] Iyzico response:", JSON.stringify(result, null, 2))
  return result
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] === Starting iyzico setup ===")
    console.log("[v0] Base URL:", IYZICO_BASE_URL)
    console.log("[v0] API Key:", process.env.IYZICO_API_KEY?.substring(0, 10) + "...")

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

    console.log("[v0] Fetching packages from database...")
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Checking if iyzico columns exist...")
    const { data: testPackage } = await supabase.from("packages").select("id").limit(1).single()

    if (testPackage) {
      const { error: testError } = await supabase
        .from("packages")
        .update({
          iyzico_product_code: "test",
          iyzico_monthly_plan_code: "test",
        })
        .eq("id", testPackage.id)

      if (testError) {
        console.error("[v0] Columns don't exist! Error:", testError)
        return NextResponse.json(
          {
            success: false,
            error: "İyzico kolonları database'de bulunamadı. Lütfen şu SQL komutunu Supabase SQL Editor'de çalıştırın:",
            sql: `ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS iyzico_product_code TEXT,
ADD COLUMN IF NOT EXISTS iyzico_monthly_plan_code TEXT;`,
            details: testError.message,
          },
          { status: 500 },
        )
      }

      // Test değerlerini geri al
      await supabase
        .from("packages")
        .update({
          iyzico_product_code: null,
          iyzico_monthly_plan_code: null,
        })
        .eq("id", testPackage.id)

      console.log("[v0] Columns exist and are writable")
    }

    const { data: packages, error: dbError } = await supabase
      .from("packages")
      .select("*")
      .gt("price_monthly", 0)
      .order("price_monthly", { ascending: true })

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    if (!packages || packages.length === 0) {
      console.log("[v0] No packages found")
      return NextResponse.json({
        success: false,
        error: "No packages found in database",
      })
    }

    const allowedPackages = ["basic", "plus", "pro"]
    const filteredPackages = packages.filter((pkg) => allowedPackages.includes(pkg.name.toLowerCase()))

    console.log("[v0] Processing", filteredPackages.length, "packages (filtered from", packages.length, ")")

    const results = []

    for (const pkg of filteredPackages) {
      try {
        console.log(`[v0] Processing package: ${pkg.name}`)

        console.log(`[v0] Creating product for: ${pkg.name}`)
        const productResult = await makeIyzicoRequest("/v2/subscription/products", {
          locale: "tr",
          name: `${pkg.name}-${Date.now()}`,
          description: pkg.display_name_tr || `${pkg.name} paketi`,
        })

        console.log(`[v0] Product result:`, productResult)

        if (productResult.status !== "success") {
          throw new Error(productResult.errorMessage || "Failed to create product")
        }

        const productReferenceCode = productResult.data?.referenceCode
        console.log(`[v0] Product created with code: ${productReferenceCode}`)

        console.log(`[v0] Creating monthly pricing plan for: ${pkg.name}`)
        const monthlyPlanResult = await makeIyzicoRequest(
          `/v2/subscription/products/${productReferenceCode}/pricing-plans`,
          {
            locale: "tr",
            name: `${pkg.name}-monthly-${Date.now()}`,
            paymentInterval: "MONTHLY",
            paymentIntervalCount: 1,
            trialPeriodDays: 0,
            price: (pkg.price_monthly / 100).toFixed(2),
            currencyCode: "TRY",
            planPaymentType: "RECURRING",
          },
        )

        if (monthlyPlanResult.status !== "success") {
          throw new Error(monthlyPlanResult.errorMessage || "Failed to create monthly plan")
        }

        const monthlyPlanCode = monthlyPlanResult.data?.referenceCode
        console.log(`[v0] Monthly plan created with code: ${monthlyPlanCode}`)

        console.log(`[v0] Updating database for package: ${pkg.name}`)
        const { error: updateError } = await supabase
          .from("packages")
          .update({
            iyzico_product_code: productReferenceCode,
            iyzico_monthly_plan_code: monthlyPlanCode,
          })
          .eq("id", pkg.id)

        if (updateError) {
          console.error(`[v0] Database update error for ${pkg.name}:`, updateError)
          throw new Error(`Database update failed: ${updateError.message}`)
        }

        // Verify the update was successful
        console.log(`[v0] Verifying database update for package: ${pkg.name}`)
        const { data: verifyData, error: verifyError } = await supabase
          .from("packages")
          .select("iyzico_product_code, iyzico_monthly_plan_code")
          .eq("id", pkg.id)
          .single()

        if (verifyError) {
          console.error(`[v0] Verification error for ${pkg.name}:`, verifyError)
          throw new Error(`Verification failed: ${verifyError.message}`)
        }

        console.log(`[v0] Verified data for ${pkg.name}:`, verifyData)

        if (!verifyData.iyzico_product_code || !verifyData.iyzico_monthly_plan_code) {
          console.error(`[v0] WARNING: Columns are still NULL after update!`)
          console.error(`[v0] Expected product code: ${productReferenceCode}`)
          console.error(`[v0] Expected plan code: ${monthlyPlanCode}`)
          console.error(`[v0] Actual data:`, verifyData)
          throw new Error(
            `Database update verification failed: iyzico_product_code=${verifyData.iyzico_product_code}, iyzico_monthly_plan_code=${verifyData.iyzico_monthly_plan_code}`,
          )
        }

        console.log(`[v0] Successfully processed and verified package: ${pkg.name}`)

        results.push({
          package: pkg.name,
          success: true,
          productReferenceCode,
          monthlyPlanCode,
        })
      } catch (error) {
        console.error(`[v0] Error processing package ${pkg.name}:`, error)
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
