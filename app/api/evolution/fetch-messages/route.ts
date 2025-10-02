import { type NextRequest, NextResponse } from "next/server"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "https://evolu.cetoloji.com"
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add delay between retries (exponential backoff)
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Max 5 seconds
        console.log(`[v0] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      const response = await fetch(url, options)

      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response
      }

      // For server errors (5xx), retry
      console.log(`[v0] Server error ${response.status}, will retry...`)
      lastError = new Error(`Server error: ${response.status}`)
    } catch (error) {
      console.log(`[v0] Fetch error on attempt ${attempt + 1}:`, error instanceof Error ? error.message : String(error))
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  throw lastError || new Error("Failed to fetch after retries")
}

export async function POST(request: NextRequest) {
  try {
    const { instanceName, remoteJid, limit = 50 } = await request.json()

    console.log("[v0] Fetching messages for:", { instanceName, remoteJid, limit })

    if (!instanceName || !remoteJid) {
      return NextResponse.json({ error: "Instance name and remoteJid are required" }, { status: 400 })
    }

    const url = `${EVOLUTION_API_URL}/chat/findMessages/${instanceName}`
    const requestBody = {
      where: {
        key: {
          remoteJid: remoteJid,
        },
      },
      limit: limit,
    }

    console.log("[v0] Evolution API URL:", url)
    console.log("[v0] Request body:", JSON.stringify(requestBody))

    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      cache: "no-store",
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Evolution API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Evolution API error:", response.status, response.statusText, errorText)
      return NextResponse.json({ error: "Failed to fetch messages from Evolution API" }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Response data structure:", Object.keys(data))

    let messages: any[] = []
    if (Array.isArray(data)) {
      messages = data
    } else if (data && data.messages && Array.isArray(data.messages.records)) {
      // Evolution API returns paginated response: { messages: { total, pages, currentPage, records: [...] } }
      messages = data.messages.records
    } else if (data && Array.isArray(data.messages)) {
      messages = data.messages
    } else if (data && Array.isArray(data.data)) {
      messages = data.data
    } else {
      console.error("[v0] Unexpected response format:", JSON.stringify(data).substring(0, 200))
      return NextResponse.json({ error: "Unexpected response format from Evolution API" }, { status: 500 })
    }

    console.log("[v0] Successfully fetched messages, count:", messages.length)

    // Transform messages to match our message format
    const transformedMessages = messages.map((msg: any) => ({
      id: msg.key.id,
      conversation_id: remoteJid,
      content:
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        "[Media message]",
      is_from_bot: msg.key.fromMe,
      handled_by: msg.key.fromMe ? "ai" : "customer",
      operator_id: null,
      timestamp: new Date((msg.messageTimestamp || Date.now() / 1000) * 1000).toISOString(),
      sender_phone: msg.key.fromMe ? null : msg.key.remoteJid.replace(/@s\.whatsapp\.net|@c\.us/g, ""),
      recipient_phone: msg.key.fromMe ? msg.key.remoteJid.replace(/@s\.whatsapp\.net|@c\.us/g, "") : null,
      message_type: msg.message?.conversation ? "text" : "media",
      status: "delivered",
      whatsapp_message_id: msg.key.id,
    }))

    // Sort by timestamp ascending (oldest first)
    transformedMessages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return NextResponse.json(
      { success: true, messages: transformedMessages },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
