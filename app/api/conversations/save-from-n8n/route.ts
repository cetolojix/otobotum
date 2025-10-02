import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface SaveConversationRequest {
  instanceName: string
  phoneNumber: string
  senderName?: string
  messageText: string
  messageId: string
  timestamp: number
}

export async function POST(request: NextRequest) {
  try {
    const { instanceName, phoneNumber, senderName, messageText, messageId, timestamp }: SaveConversationRequest =
      await request.json()

    console.log("[v0] [Save Conversation] Received request for instance:", instanceName)
    console.log("[v0] [Save Conversation] Phone:", phoneNumber)
    console.log("[v0] [Save Conversation] Message:", messageText)

    // Validate required fields
    if (!instanceName || !phoneNumber || !messageText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get instance
    const { data: instance, error: instanceError } = await supabase
      .from("instances")
      .select("id, user_id")
      .eq("instance_name", instanceName)
      .single()

    if (instanceError || !instance) {
      console.error("[v0] [Save Conversation] Instance not found:", instanceName, instanceError)
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    }

    console.log("[v0] [Save Conversation] Found instance:", instance.id)

    // Clean phone number
    const cleanPhone = phoneNumber.replace(/@s\.whatsapp\.net|@c\.us/g, "")
    console.log("[v0] [Save Conversation] Cleaned phone:", cleanPhone)

    // Get or create contact
    let { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("instance_id", instance.id)
      .eq("phone_number", cleanPhone)
      .single()

    if (!contact) {
      console.log("[v0] [Save Conversation] Creating new contact")
      const { data: newContact, error: createContactError } = await supabase
        .from("contacts")
        .insert({
          instance_id: instance.id,
          phone_number: cleanPhone,
          name: senderName || cleanPhone,
          is_blocked: false,
        })
        .select()
        .single()

      if (createContactError) {
        console.error("[v0] [Save Conversation] Failed to create contact:", createContactError)
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
      }

      contact = newContact
      console.log("[v0] [Save Conversation] Created contact:", contact.id)
    } else if (senderName && contact.name !== senderName) {
      // Update contact name if it changed
      console.log("[v0] [Save Conversation] Updating contact name")
      await supabase.from("contacts").update({ name: senderName }).eq("id", contact.id)
    }

    // Get or create conversation
    let { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("instance_id", instance.id)
      .eq("contact_id", contact.id)
      .single()

    const messageTimestamp = new Date(timestamp * 1000).toISOString()

    if (!conversation) {
      console.log("[v0] [Save Conversation] Creating new conversation")
      const { data: newConv, error: createConvError } = await supabase
        .from("conversations")
        .insert({
          instance_id: instance.id,
          contact_id: contact.id,
          status: "active",
          last_message_at: messageTimestamp,
          unread_count: 1,
        })
        .select()
        .single()

      if (createConvError) {
        console.error("[v0] [Save Conversation] Failed to create conversation:", createConvError)
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
      }

      conversation = newConv
      console.log("[v0] [Save Conversation] Created conversation:", conversation.id)
    } else {
      // Update conversation
      console.log("[v0] [Save Conversation] Updating existing conversation")
      await supabase
        .from("conversations")
        .update({
          last_message_at: messageTimestamp,
          unread_count: (conversation.unread_count || 0) + 1,
          status: "active",
        })
        .eq("id", conversation.id)
    }

    // Save message
    console.log("[v0] [Save Conversation] Saving message")
    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      content: messageText,
      is_from_bot: false,
      message_type: "text",
      status: "received",
      timestamp: messageTimestamp,
      sender_phone: cleanPhone,
      whatsapp_message_id: messageId,
    })

    if (messageError) {
      console.error("[v0] [Save Conversation] Failed to save message:", messageError)
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    console.log("[v0] [Save Conversation] Message saved successfully")

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      contactId: contact.id,
    })
  } catch (error) {
    console.error("[v0] [Save Conversation] Error:", error)
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 })
  }
}
