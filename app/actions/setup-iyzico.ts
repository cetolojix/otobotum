"use server"

import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"

function generateRandomString(): string {
  return crypto.randomBytes(16).toString("hex")
}

function generateAuthHeader(
  apiKey: string,
  secretKey: string,
  uri: string,
  body: object,
  randomString: string,
): string {
  // Official SDK format: randomString + uri + JSON.stringify(body)
  const bodyString = JSON.stringify(body)
  const dataToSign = randomString + uri + bodyString

  // Generate HMAC-SHA256 signature (hex encoded) - using Node.js crypto
  const signatureHex = crypto.createHmac("sha256", secretKey).update(dataToSign).digest("hex")

  // Build authorization params: apiKey:xxx&randomKey:xxx&signature:xxx
  const authorizationParams = [`apiKey:${apiKey}`, `randomKey:${randomString}`, `signature:${signatureHex}`].join("&")

  // Base64 encode
  const base64Auth = Buffer.from(authorizationParams).toString("base64")

  // Return in IYZWSv2 format
  return `IYZWSv2 ${base64Auth}`
}

export async function setupIyzicoProducts() {
  try {
    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
      return {
        success: false,
        error: "iyzico API credentials not configured",
      }
    }

    const supabase = await createClient()

    const { data: packages, error: packagesError } = await supabase.from("packages").select("*")

    if (packagesError) {
      return {
        success: false,
        error: "Failed to fetch packages from database",
      }
    }

    const apiKey = process.env.IYZICO_API_KEY!
    const secretKey = process.env.IYZICO_SECRET_KEY!
    const baseUrl = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com"

    const results = []

    for (const pkg of packages || []) {
      try {
        const productRandomString = generateRandomString()

        // Create product in iyzico
        const productBody = {
          locale: "tr",
          conversationId: `product-${pkg.id}`,
          name: pkg.name,
          description: pkg.description || `${pkg.name} paketi`,
        }

        const productUrl = "/v2/subscription/products"
        const productAuthHeader = generateAuthHeader(apiKey, secretKey, productUrl, productBody, productRandomString)

        const productResponse = await fetch(`${baseUrl}${productUrl}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: productAuthHeader,
            "x-iyzi-rnd": productRandomString,
            "x-iyzi-client-version": "iyzipay-node-2.0.64",
          },
          body: JSON.stringify(productBody),
        })

        const productData = await productResponse.json()

        if (!productResponse.ok || productData.status !== "success") {
          results.push({
            package: pkg.name,
            success: false,
            error: productData.errorMessage || "Failed to create product",
            errorCode: productData.errorCode,
          })
          continue
        }

        const productReferenceCode = productData.data.referenceCode

        const monthlyRandomString = generateRandomString()

        // Create monthly pricing plan
        const monthlyPlanBody = {
          locale: "tr",
          conversationId: `plan-monthly-${pkg.id}`,
          productReferenceCode,
          name: `${pkg.name} - Aylık`,
          price: pkg.monthly_price.toString(),
          currencyCode: "TRY",
          paymentInterval: "MONTHLY",
          paymentIntervalCount: 1,
          trialPeriodDays: 0,
          planPaymentType: "RECURRING",
        }

        const planUrl = "/v2/subscription/pricing-plans"
        const monthlyPlanAuthHeader = generateAuthHeader(
          apiKey,
          secretKey,
          planUrl,
          monthlyPlanBody,
          monthlyRandomString,
        )

        const monthlyPlanResponse = await fetch(`${baseUrl}${planUrl}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: monthlyPlanAuthHeader,
            "x-iyzi-rnd": monthlyRandomString,
            "x-iyzi-client-version": "iyzipay-node-2.0.64",
          },
          body: JSON.stringify(monthlyPlanBody),
        })

        const monthlyPlanData = await monthlyPlanResponse.json()

        if (!monthlyPlanResponse.ok || monthlyPlanData.status !== "success") {
          results.push({
            package: pkg.name,
            success: false,
            error: monthlyPlanData.errorMessage || "Failed to create monthly plan",
            errorCode: monthlyPlanData.errorCode,
          })
          continue
        }

        const monthlyPlanReferenceCode = monthlyPlanData.data.referenceCode

        const yearlyRandomString = generateRandomString()

        // Create yearly pricing plan
        const yearlyPlanBody = {
          locale: "tr",
          conversationId: `plan-yearly-${pkg.id}`,
          productReferenceCode,
          name: `${pkg.name} - Yıllık`,
          price: pkg.yearly_price.toString(),
          currencyCode: "TRY",
          paymentInterval: "YEARLY",
          paymentIntervalCount: 1,
          trialPeriodDays: 0,
          planPaymentType: "RECURRING",
        }

        const yearlyPlanAuthHeader = generateAuthHeader(apiKey, secretKey, planUrl, yearlyPlanBody, yearlyRandomString)

        const yearlyPlanResponse = await fetch(`${baseUrl}${planUrl}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: yearlyPlanAuthHeader,
            "x-iyzi-rnd": yearlyRandomString,
            "x-iyzi-client-version": "iyzipay-node-2.0.64",
          },
          body: JSON.stringify(yearlyPlanBody),
        })

        const yearlyPlanData = await yearlyPlanResponse.json()

        if (!yearlyPlanResponse.ok || yearlyPlanData.status !== "success") {
          results.push({
            package: pkg.name,
            success: false,
            error: yearlyPlanData.errorMessage || "Failed to create yearly plan",
            errorCode: yearlyPlanData.errorCode,
          })
          continue
        }

        const yearlyPlanReferenceCode = yearlyPlanData.data.referenceCode

        // Update package with reference codes
        const { error: updateError } = await supabase
          .from("packages")
          .update({
            iyzico_product_reference_code: productReferenceCode,
            iyzico_monthly_plan_reference_code: monthlyPlanReferenceCode,
            iyzico_yearly_plan_reference_code: yearlyPlanReferenceCode,
          })
          .eq("id", pkg.id)

        if (updateError) {
          results.push({
            package: pkg.name,
            success: false,
            error: "Failed to update package in database",
          })
          continue
        }

        results.push({
          package: pkg.name,
          success: true,
          productReferenceCode,
          monthlyPlanReferenceCode,
          yearlyPlanReferenceCode,
        })
      } catch (error) {
        results.push({
          package: pkg.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return {
      success: true,
      message: "iyzico products and pricing plans created successfully",
      results,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
