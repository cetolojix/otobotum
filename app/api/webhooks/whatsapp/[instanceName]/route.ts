import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface WhatsAppMessage {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  message?: {
    conversation?: string
    extendedTextMessage?: {
      text: string
    }
  }
  messageTimestamp: number
  pushName?: string
}

interface WebhookPayload {
  event: string
  instance: string
  data: {
    messages?: WhatsAppMessage[]
    connection?: {
      state: string
      lastDisconnect?: any
    }
  }
}

export async function POST(request: NextRequest, { params }: { params: { instanceName: string } }) {
  try {
    const { instanceName } = params
    const payload: WebhookPayload = await request.json()

    console.log(`[v0] [Webhook] Received event for ${instanceName}:`, payload.event)
    console.log(`[v0] [Webhook] Full payload:`, JSON.stringify(payload, null, 2))

    // Handle different webhook events
    switch (payload.event) {
      case "messages.upsert":
      case "MESSAGES_UPSERT": // Support both formats for backward compatibility
        if (payload.data.messages) {
          console.log(`[v0] [Webhook] Processing ${payload.data.messages.length} message(s)`)
          for (const message of payload.data.messages) {
            // Skip messages sent by us
            if (message.key.fromMe) {
              console.log(`[v0] [Webhook] Skipping message from bot`)
              continue
            }

            // Extract message text
            const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text

            if (messageText) {
              console.log(`[v0] [Webhook] Processing message from ${message.key.remoteJid}: ${messageText}`)
              await handleIncomingMessage(instanceName, {
                messageId: message.key.id,
                from: message.key.remoteJid,
                text: messageText,
                timestamp: message.messageTimestamp,
                senderName: message.pushName,
              })
            } else {
              console.log(`[v0] [Webhook] No text content in message`)
            }
          }
        } else {
          console.log(`[v0] [Webhook] No messages in payload`)
        }
        break

      case "connection.update":
        console.log(`[v0] [Connection] ${instanceName}:`, payload.data.connection?.state)
        break

      default:
        console.log(`[v0] [Webhook] Unknown event: ${payload.event}`)
    }

    return NextResponse.json({ success: true, processed: true })
  } catch (error) {
    console.error("[v0] [Webhook] Processing error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 200 })
  }
}

async function handleIncomingMessage(
  instanceName: string,
  messageData: {
    messageId: string
    from: string
    text: string
    timestamp: number
    senderName?: string
  },
) {
  try {
    console.log(`[v0] [Webhook] handleIncomingMessage called for ${instanceName}`)
    const supabase = await createClient()

    // Get instance
    const { data: instance, error: instanceError } = await supabase
      .from("instances")
      .select("id, user_id, custom_prompt")
      .eq("instance_name", instanceName)
      .single()

    if (instanceError || !instance) {
      console.error(`[v0] [Webhook] Instance not found: ${instanceName}`, instanceError)
      return
    }

    console.log(`[v0] [Webhook] Found instance:`, instance.id)

    // Extract phone number from remoteJid
    const phoneNumber = messageData.from.replace("@s.whatsapp.net", "")
    console.log(`[v0] [Webhook] Processing message from phone: ${phoneNumber}`)

    const { forwardToChatwoot } = await import("@/lib/chatwoot-bridge")
    await forwardToChatwoot(instanceName, messageData, instance.user_id)

    let { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("instance_id", instance.id)
      .eq("phone_number", phoneNumber)
      .single()

    if (!contact) {
      console.log(`[v0] [Webhook] Creating new contact for ${phoneNumber}`)
      // Create new contact
      const { data: newContact, error: createContactError } = await supabase
        .from("contacts")
        .insert({
          instance_id: instance.id,
          phone_number: phoneNumber,
          name: messageData.senderName || phoneNumber,
          is_blocked: false,
        })
        .select()
        .single()

      if (createContactError) {
        console.error(`[v0] [Webhook] Failed to create contact:`, createContactError)
        return
      }

      contact = newContact
      console.log(`[v0] [Webhook] Created contact:`, contact.id)
    } else if (messageData.senderName && contact.name !== messageData.senderName) {
      // Update contact name if it changed
      console.log(`[v0] [Webhook] Updating contact name from ${contact.name} to ${messageData.senderName}`)
      await supabase.from("contacts").update({ name: messageData.senderName }).eq("id", contact.id)
    }

    if (!contact) {
      console.error("[v0] [Webhook] Failed to create/get contact")
      return
    }

    let { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*, ai_enabled, assigned_operator")
      .eq("instance_id", instance.id)
      .eq("contact_id", contact.id)
      .single()

    if (!conversation) {
      console.log(`[v0] [Webhook] Creating new conversation for contact ${contact.id}`)
      // Create new conversation
      const { data: newConv, error: createConvError } = await supabase
        .from("conversations")
        .insert({
          instance_id: instance.id,
          contact_id: contact.id,
          status: "active",
          last_message_at: new Date(messageData.timestamp * 1000).toISOString(),
          unread_count: 1,
          ai_enabled: true, // Default to AI enabled for new conversations
        })
        .select()
        .single()

      if (createConvError) {
        console.error(`[v0] [Webhook] Failed to create conversation:`, createConvError)
        return
      }

      conversation = newConv
      console.log(`[v0] [Webhook] Created conversation:`, conversation.id)
    } else {
      console.log(`[v0] [Webhook] Updating existing conversation ${conversation.id}`)
      // Update conversation
      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date(messageData.timestamp * 1000).toISOString(),
          unread_count: (conversation.unread_count || 0) + 1,
          status: "active",
        })
        .eq("id", conversation.id)
    }

    if (!conversation) {
      console.error("[v0] [Webhook] Failed to create/get conversation")
      return
    }

    // Save incoming message
    console.log(`[v0] [Webhook] Saving message to database`)
    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      content: messageData.text,
      is_from_bot: false,
      message_type: "text",
      status: "received",
      timestamp: new Date(messageData.timestamp * 1000).toISOString(),
      sender_phone: phoneNumber,
      whatsapp_message_id: messageData.messageId,
    })

    if (messageError) {
      console.error(`[v0] [Webhook] Failed to save message:`, messageError)
      return
    }

    console.log(`[v0] [Webhook] Message saved successfully`)

    const aiEnabled = conversation.ai_enabled !== false
    console.log(`[v0] [Webhook] AI enabled status: ${aiEnabled}`)

    if (aiEnabled) {
      console.log(`[v0] [Webhook] AI enabled, triggering n8n workflow`)
      // Trigger n8n workflow for AI response
      await triggerN8nWorkflow(instanceName, messageData, instance.custom_prompt, contact)
    } else {
      console.log(`[v0] [Webhook] AI disabled, forwarding to operator`)
      // Human intervention mode - forward to operator
      await forwardToOperator(conversation, messageData, instanceName, contact)
    }
  } catch (error) {
    console.error("[v0] [Webhook] Failed to handle incoming message:", error)
  }
}

async function forwardToOperator(
  conversation: any,
  messageData: {
    messageId: string
    from: string
    text: string
    timestamp: number
    senderName?: string
  },
  instanceName: string,
  contact: any,
) {
  try {
    const supabase = await createClient()

    const assignedOperator = conversation.assigned_operator

    if (!assignedOperator) {
      console.log("[v0] [Webhook] No operator assigned, message will wait in queue")
      return
    }

    const { data: operator } = await supabase
      .from("profiles")
      .select("phone, full_name")
      .eq("id", assignedOperator)
      .single()

    if (!operator || !operator.phone) {
      console.log("[v0] [Webhook] Operator has no phone number configured")
      return
    }

    // Send notification to operator via WhatsApp
    const notificationMessage = `🔔 Yeni Mesaj - ${instanceName}

Müşteri: ${contact.name}
Telefon: ${contact.phone_number}

Mesaj: ${messageData.text}

Yanıt vermek için konuşma paneline gidin.`

    await fetch(`https://evolu.cetoloji.com/message/sendText/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L",
      },
      body: JSON.stringify({
        number: operator.phone.includes("@") ? operator.phone : `${operator.phone}@s.whatsapp.net`,
        text: notificationMessage,
      }),
    })

    // Log the handoff
    await supabase.from("handoff_conversation_log").insert({
      handoff_request_id: null,
      sender_phone: contact.phone_number,
      sender_type: "customer",
      message_type: "text",
      message_text: messageData.text,
    })

    console.log(`[v0] [Webhook] Message forwarded to operator: ${operator.full_name}`)
  } catch (error) {
    console.error("[v0] [Webhook] Failed to forward to operator:", error)
  }
}

async function triggerN8nWorkflow(instanceName: string, messageData: any, customPrompt?: string | null, contact?: any) {
  try {
    const webhookUrl = `https://n8nx.cetoloji.com/webhook/${instanceName}`

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instanceName,
        messageType: "conversation",
        message: {
          conversation: messageData.text,
        },
        key: {
          remoteJid: messageData.from,
          id: messageData.messageId,
        },
        messageTimestamp: messageData.timestamp,
        pushName: messageData.senderName || contact?.name,
        customPrompt: customPrompt || undefined,
      }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status}`)
    }

    console.log(`[n8n] Workflow triggered for ${instanceName}`)
  } catch (error) {
    console.error("Failed to trigger n8n workflow:", error)
  }
}
