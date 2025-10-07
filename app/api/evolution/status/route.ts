import { type NextRequest, NextResponse } from "next/server"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "https://evolu.cetoloji.com"
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

const lastRequestTime = new Map<string, number>()
const MIN_REQUEST_INTERVAL = 2000 // 2 seconds between requests

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instance")

    console.log("[v0] Checking status for instance:", instanceName)

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    const now = Date.now()
    const lastRequest = lastRequestTime.get(instanceName) || 0
    if (now - lastRequest < MIN_REQUEST_INTERVAL) {
      console.log("[v0] Rate limiting: too soon, returning cached status")
      return NextResponse.json({
        success: true,
        status: "connecting",
        instanceName,
        details: { state: "connecting", message: "Checking connection..." },
        timestamp: new Date().toISOString(),
      })
    }
    lastRequestTime.set(instanceName, now)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    let response
    try {
      response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
        headers: {
          apikey: EVOLUTION_API_KEY,
          Accept: "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      })
      clearTimeout(timeoutId)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error("[v0] Fetch error:", fetchError)

      return NextResponse.json({
        success: true,
        status: "connecting",
        instanceName,
        details: {
          state: "connecting",
          message: "Bağlantı kontrol ediliyor...",
        },
        timestamp: new Date().toISOString(),
      })
    }

    console.log("[v0] Status response:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Status error response:", errorText)

      if (response.status === 429) {
        return NextResponse.json({
          success: true,
          status: "connecting",
          instanceName,
          details: { state: "connecting", message: "Rate limited, please wait..." },
          timestamp: new Date().toISOString(),
        })
      }

      if (response.status === 404) {
        return NextResponse.json({ error: "Instance not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        status: "disconnected",
        instanceName,
        details: {
          state: "close",
          message: "Bağlantı durumu alınamadı",
        },
        timestamp: new Date().toISOString(),
      })
    }

    const data = await response.json()
    console.log("[v0] Status data:", JSON.stringify(data, null, 2))

    let status = "disconnected"
    let details = {}

    if (data.instance) {
      switch (data.instance.state) {
        case "open":
          status = "connected"
          break
        case "connecting":
          status = "connecting"
          break
        case "close":
        default:
          status = "disconnected"
          break
      }

      details = {
        state: data.instance.state,
        profileName: data.instance.profileName,
        profilePictureUrl: data.instance.profilePictureUrl,
        number: data.instance.number,
        lastSeen: data.instance.lastSeen,
      }
    }

    return NextResponse.json({
      success: true,
      status,
      instanceName,
      details,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error checking instance status:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to check status"

    return NextResponse.json({
      success: true,
      status: "connecting",
      instanceName: "unknown",
      details: {
        state: "connecting",
        message: "Durum kontrol ediliyor...",
      },
      timestamp: new Date().toISOString(),
    })
  }
}
