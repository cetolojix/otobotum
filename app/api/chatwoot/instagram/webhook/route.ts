import { NextResponse } from "next/server"

// Instagram webhook verification (Facebook Graph API)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN

    if (mode === "subscribe" && token === verifyToken) {
      console.log("[Instagram Webhook] Verification successful")
      return new NextResponse(challenge, { status: 200 })
    }

    console.log("[Instagram Webhook] Verification failed")
    return NextResponse.json({ error: "Verification failed" }, { status: 403 })
  } catch (error) {
    console.error("[Instagram Webhook] Verification error:", error)
    return NextResponse.json({ error: "Verification error" }, { status: 500 })
  }
}

// Instagram webhook handler
export async function POST(request: Request) {
  try {
    const payload = await request.json()

    console.log("[Instagram Webhook] Received payload:", JSON.stringify(payload, null, 2))

    // Handle Instagram webhook events
    if (payload.object === "instagram") {
      for (const entry of payload.entry || []) {
        // Handle messaging events
        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.message) {
              await handleInstagramMessage(event)
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Instagram Webhook] Processing error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 200 })
  }
}

async function handleInstagramMessage(event: any) {
  try {
    const senderId = event.sender.id
    const recipientId = event.recipient.id
    const messageText = event.message.text
    const timestamp = event.timestamp

    console.log(`[Instagram] Message from ${senderId}: ${messageText}`)

    // Forward to Chatwoot
    // Note: This requires Chatwoot Instagram channel to be set up
    // Chatwoot will handle the message automatically if the channel is configured

    // You can also implement custom logic here if needed
    // For example, save to database, trigger notifications, etc.
  } catch (error) {
    console.error("[Instagram] Failed to handle message:", error)
  }
}
