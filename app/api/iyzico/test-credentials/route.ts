import { type NextRequest, NextResponse } from "next/server"

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

export async function GET(request: NextRequest) {
  try {
    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "iyzico credentials not configured",
          instructions:
            "Please add IYZICO_API_KEY and IYZICO_SECRET_KEY to your environment variables in Project Settings",
        },
        { status: 400 },
      )
    }

    const apiKey = process.env.IYZICO_API_KEY
    const secretKey = process.env.IYZICO_SECRET_KEY
    const baseUrl = process.env.IYZICO_BASE_URL || "https://api.iyzipay.com"

    // Test with a simple BIN check request
    const randomString = await generateRandomString()
    const uri = "/payment/bin/check"
    const body = {
      locale: "tr",
      conversationId: "test-" + Date.now(),
      binNumber: "554960",
    }

    const authHeader = await generateAuthHeader(apiKey, secretKey, uri, body, randomString)

    const response = await fetch(`${baseUrl}${uri}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        "x-iyzi-rnd": randomString,
        "x-iyzi-client-version": "iyzipay-node-2.0.64",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return NextResponse.json({
      success: response.ok && data.status === "success",
      statusCode: response.status,
      iyzicoResponse: data,
      message:
        response.ok && data.status === "success"
          ? "Credentials are valid!"
          : "Authentication failed. Please check your iyzico API credentials.",
      troubleshooting: {
        apiKeyPrefix: apiKey.substring(0, 8) + "...",
        baseUrl,
        responseStatus: data.status,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
