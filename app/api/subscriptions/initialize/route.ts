import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

// Helper functions for iyzico API
async function hmacSha256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const messageData = encoder.encode(data)

  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function generateRandomString(length = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  return result
}

async function generateAuthHeader(
  apiKey: string,
  secretKey: string,
  uri: string,
  randomString: string,
  requestBody: string,
) {
  const dataToSign = randomString + uri + requestBody
  const signature = await hmacSha256(secretKey, dataToSign)

  const authorizationParams = [`apiKey:${apiKey}`, `randomKey:${randomString}`, `signature:${signature}`].join("&")

  const base64Auth = btoa(authorizationParams)
  return `IYZWSv2 ${base64Auth}`
}

async function makeIyzicoRequest(endpoint: string, body: any) {
  const apiKey = process.env.IYZICO_API_KEY
  const secretKey = process.env.IYZICO_SECRET_KEY
  const baseUrl = process.env.IYZICO_BASE_URL || "https://api.iyzipay.com"

  if (!apiKey || !secretKey) {
    throw new Error("iyzico API credentials not configured")
  }

  const url = `${baseUrl}${endpoint}`
  const requestBody = JSON.stringify(body)
  const randomString = generateRandomString()
  const authHeader = await generateAuthHeader(apiKey, secretKey, endpoint, randomString, requestBody)

  console.log("[v0] Making iyzico request to:", url)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
      "x-iyzi-rnd": randomString,
    },
    body: requestBody,
  })

  const contentType = response.headers.get("content-type")
  console.log("[v0] Response status:", response.status, "Content-Type:", contentType)

  if (!contentType?.includes("application/json")) {
    const text = await response.text()
    console.error("[v0] Non-JSON response received:", text.substring(0, 500))
    throw new Error(`iyzico API returned non-JSON response: ${text.substring(0, 100)}`)
  }

  const data = await response.json()
  console.log("[v0] Iyzico response:", JSON.stringify(data))

  if (data.status !== "success") {
    throw new Error(data.errorMessage || "iyzico API request failed")
  }

  return data
}

export async function POST(request: NextRequest) {
  console.log("[v0] === Subscription Initialize API Called ===")

  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { packageId, billingCycle } = body

    console.log("[v0] Initialize subscription request:", { packageId, billingCycle })

    if (!packageId) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    // Default to monthly if not provided
    const cycle = billingCycle || "monthly"

    let supabase
    try {
      supabase = await createClient()
      console.log("[v0] Supabase client created successfully")
    } catch (supabaseError) {
      console.error("[v0] Failed to create Supabase client:", supabaseError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: supabaseError instanceof Error ? supabaseError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      console.log("[v0] Profile not found for user:", user.id)
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from("packages")
      .select("*")
      .eq("id", packageId)
      .single()

    if (packageError || !packageData) {
      console.log("[v0] Package not found:", packageId, packageError)
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    console.log("[v0] Package data:", {
      name: packageData.name,
      hasMonthlyPlan: !!packageData.iyzico_monthly_plan_code,
    })

    // Get the pricing plan reference code
    const pricingPlanReferenceCode = packageData.iyzico_monthly_plan_code

    if (!pricingPlanReferenceCode) {
      console.log("[v0] Pricing plan not configured for package:", packageData.name)
      return NextResponse.json(
        {
          error: "Pricing plan not configured. Please run iyzico setup first.",
          needsSetup: true,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Initializing subscription with plan:", pricingPlanReferenceCode)

    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/subscriptions/callback`

    const initializeRequest = {
      locale: "tr",
      customer: {
        name: profile.full_name || user.email?.split("@")[0] || "User",
        surname: ".",
        identityNumber: "11111111111", // Test için
        email: user.email,
        gsmNumber: profile.phone || "+905555555555",
        billingAddress: {
          address: "Test Address",
          zipCode: "34000",
          contactName: profile.full_name || "User",
          city: "Istanbul",
          country: "Turkey",
        },
        shippingAddress: {
          address: "Test Address",
          zipCode: "34000",
          contactName: profile.full_name || "User",
          city: "Istanbul",
          country: "Turkey",
        },
      },
      pricingPlanReferenceCode,
      subscriptionInitialStatus: "ACTIVE",
      callbackUrl,
    }

    const result = await makeIyzicoRequest("/v2/subscription/checkoutform/initialize", initializeRequest)

    console.log("[v0] Subscription initialized successfully:", result.token)

    return NextResponse.json({
      success: true,
      checkoutFormContent: result.checkoutFormContent,
      token: result.token,
      tokenExpireTime: result.tokenExpireTime,
    })
  } catch (error) {
    console.error("[v0] Error initializing subscription:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
