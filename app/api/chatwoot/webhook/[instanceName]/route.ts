import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { forwardToWhatsApp } from "@/lib/chatwoot-bridge"

export async function POST(request: Request, { params }: { params: { instanceName: string } }) {
  try {
    const { instanceName } = params
    const payload = await request.json()

    console.log(`[Chatwoot Webhook] Received event for ${instanceName}:`, payload.event)

    // Handle message_created event
    if (payload.event === "message_created") {
      const message = payload.message
      const conversation = payload.conversation

      // Skip if message is from contact (incoming message)
      if (message.message_type === "incoming") {
        console.log(`[Chatwoot Webhook] Skipping incoming message`)
        return NextResponse.json({ success: true })
      }

      // Only process outgoing messages from agents
      if (message.message_type === "outgoing" && !message.private) {
        console.log(`[Chatwoot Webhook] Processing outgoing message from agent`)

        const supabase = await createClient()

        // Get conversation details
        const { data: chatwootConv } = await supabase
          .from("chatwoot_conversations")
          .select("*")
          .eq("chatwoot_conversation_id", conversation.id)
          .eq("instance_name", instanceName)
          .maybeSingle()

        if (!chatwootConv) {
          console.log(`[Chatwoot Webhook] Conversation not found in database`)
          return NextResponse.json({ success: true })
        }

        // Forward message to WhatsApp
        await forwardToWhatsApp(instanceName, message.content, chatwootConv.phone_number)

        console.log(`[Chatwoot Webhook] Message forwarded to WhatsApp`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Chatwoot Webhook] Processing error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 200 })
  }
}
