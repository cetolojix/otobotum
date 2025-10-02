import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const instanceName = searchParams.get("instanceName")

    const evolutionApiUrl = process.env.EVOLUTION_API_URL || "https://evolu.cetoloji.com"
    const evolutionApiKey = process.env.EVOLUTION_API_KEY || "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

    if (!instanceName) {
      console.error("[v0] Instance name is required")
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log("[v0] ========== FETCH CHATS START ==========")
    console.log("[v0] Instance:", instanceName)

    console.log("[v0] STEP 1: Fetching messages from Evolution API to build chat list...")
    const evolutionUrl = `${evolutionApiUrl}/chat/findMessages/${instanceName}`
    console.log("[v0] Evolution API URL:", evolutionUrl)

    let messages: any[] = []
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const evolutionResponse = await fetch(evolutionUrl, {
        method: "POST",
        headers: {
          apikey: evolutionApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          where: {},
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] Evolution API response status:", evolutionResponse.status)

      if (!evolutionResponse.ok) {
        const errorText = await evolutionResponse.text()
        console.error("[v0] Evolution API error:", errorText)

        return NextResponse.json(
          {
            error: "Evolution API error",
            details: errorText,
            status: evolutionResponse.status,
          },
          { status: 500 },
        )
      }

      const data = await evolutionResponse.json()

      if (Array.isArray(data)) {
        messages = data
      } else if (data && data.messages && Array.isArray(data.messages.records)) {
        messages = data.messages.records
      } else if (data && Array.isArray(data.messages)) {
        messages = data.messages
      } else if (data && Array.isArray(data.data)) {
        messages = data.data
      } else {
        console.warn("[v0] Unexpected response format, using empty array")
        messages = []
      }

      console.log("[v0] Evolution API returned", messages.length, "messages")
    } catch (fetchError: any) {
      console.error("[v0] Failed to fetch from Evolution API:", fetchError.message || fetchError)

      // Check if it's a timeout error
      if (fetchError.name === "AbortError") {
        console.error("[v0] Request timed out after 10 seconds")
        return NextResponse.json(
          {
            success: false,
            error: "Evolution API request timed out",
            chats: [],
          },
          { status: 504 },
        )
      }

      // Return empty array with warning for other errors
      console.warn("[v0] Returning empty chat list due to Evolution API error")
      return NextResponse.json({
        success: true,
        chats: [],
        warning: "Failed to fetch messages from Evolution API. Please check the API status.",
      })
    }

    console.log("[v0] STEP 2: Building unique chat list from messages...")
    if (!Array.isArray(messages)) {
      console.error("[v0] CRITICAL: messages is not an array, type:", typeof messages)
      messages = []
    }

    const chatMap = new Map<string, any>()

    messages.forEach((message: any) => {
      const remoteJid = message.key?.remoteJid
      if (!remoteJid) return

      const existingChat = chatMap.get(remoteJid)
      const messageTimestamp = message.messageTimestamp || 0

      if (!existingChat || messageTimestamp > (existingChat.messageTimestamp || 0)) {
        chatMap.set(remoteJid, {
          id: remoteJid,
          name: message.pushName || null,
          conversationTimestamp: messageTimestamp,
          lastMessage: message.message?.conversation || message.message?.extendedTextMessage?.text || null,
        })
      }
    })

    const chats = Array.from(chatMap.values())
    console.log("[v0] Built", chats.length, "unique chats from messages")

    const transformedChats = chats.map((chat: any) => {
      const customerPhone = chat.id?.replace("@s.whatsapp.net", "") || ""

      return {
        id: chat.id || "",
        instance_id: instanceName,
        customer_phone: customerPhone,
        customer_name: chat.name || null,
        status: "active",
        ai_enabled: true,
        assigned_operator: null,
        tags: [],
        last_message_at: chat.conversationTimestamp
          ? new Date(chat.conversationTimestamp * 1000).toISOString()
          : new Date().toISOString(),
        unread_count: 0,
        created_at: new Date().toISOString(),
        instance_name: instanceName,
        operator_name: null,
        total_messages: 0,
        human_handled_messages: 0,
        last_message: chat.lastMessage,
      }
    })

    console.log("[v0] Transformed", transformedChats.length, "chats")
    console.log("[v0] ========== FETCH CHATS END ==========")

    return NextResponse.json({ success: true, chats: transformedChats })
  } catch (error: any) {
    console.error("[v0] FATAL ERROR:", error.message || error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch chats",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
