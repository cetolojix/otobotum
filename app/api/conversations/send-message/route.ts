import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { instanceName, customerPhone, message } = await request.json()

    if (!instanceName || !customerPhone || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Sending message:", { instanceName, customerPhone, message })

    // Send message via Evolution API
    const evolutionResponse = await fetch(`https://evolu.cetoloji.com/message/sendText/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L",
      },
      body: JSON.stringify({
        number: customerPhone.includes("@") ? customerPhone : `${customerPhone}@s.whatsapp.net`,
        text: message,
      }),
    })

    if (!evolutionResponse.ok) {
      const errorText = await evolutionResponse.text()
      console.error("[v0] Evolution API error:", errorText)
      throw new Error("Failed to send message via Evolution API")
    }

    const responseData = await evolutionResponse.json()
    console.log("[v0] Message sent successfully:", responseData)

    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    console.error("[v0] Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
