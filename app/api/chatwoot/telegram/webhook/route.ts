import { NextResponse } from "next/server"

// Telegram webhook handler
export async function POST(request: Request) {
  try {
    const payload = await request.json()

    console.log("[Telegram Webhook] Received payload:", JSON.stringify(payload, null, 2))

    // Handle Telegram webhook events
    if (payload.message) {
      await handleTelegramMessage(payload.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Telegram Webhook] Processing error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 200 })
  }
}

async function handleTelegramMessage(message: any) {
  try {
    const chatId = message.chat.id
    const userId = message.from.id
    const userName = message.from.first_name + (message.from.last_name ? ` ${message.from.last_name}` : "")
    const messageText = message.text
    const timestamp = message.date

    console.log(`[Telegram] Message from ${userName} (${userId}): ${messageText}`)

    // Forward to Chatwoot
    // Note: This requires Chatwoot Telegram channel to be set up
    // Chatwoot will handle the message automatically if the channel is configured

    // You can also implement custom logic here if needed
    // For example, save to database, trigger notifications, etc.
  } catch (error) {
    console.error("[Telegram] Failed to handle message:", error)
  }
}
