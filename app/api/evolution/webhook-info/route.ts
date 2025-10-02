import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get("instanceName")

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log(`[v0] Getting webhook info for instance: ${instanceName}`)

    const response = await fetch(`https://evolu.cetoloji.com/webhook/find/${instanceName}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L",
      },
    })

    console.log(`[v0] Webhook info response status: ${response.status}`)

    if (response.status === 404) {
      console.log(`[v0] Instance not found in Evolution API: ${instanceName}`)
      return NextResponse.json({ success: true, data: null, notFound: true })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Failed to get webhook info:`, errorText)
      return NextResponse.json({ error: "Failed to get webhook info", details: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log(`[v0] Webhook info:`, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error getting webhook info:", error)
    return NextResponse.json({ error: "Failed to get webhook info" }, { status: 500 })
  }
}
