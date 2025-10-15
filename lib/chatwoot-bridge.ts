// Chatwoot Bridge - WhatsApp ↔ Chatwoot message synchronization

import { createClient } from "@/lib/supabase/server"
import { createChatwootClient } from "@/lib/chatwoot"

interface MessageData {
  messageId: string
  from: string
  text: string
  timestamp: number
  senderName?: string
}

export async function forwardToChatwoot(
  instanceName: string,
  messageData: MessageData,
  userId: string,
  channelType: "whatsapp" | "instagram" | "telegram" | "webchat" = "whatsapp",
) {
  try {
    console.log(`[Chatwoot Bridge] Forwarding ${channelType} message to Chatwoot for ${instanceName}`)

    const supabase = await createClient()

    // Check if Chatwoot inbox exists for this instance
    const { data: inbox, error: inboxError } = await supabase
      .from("chatwoot_inboxes")
      .select("*")
      .eq("user_id", userId)
      .eq("instance_name", instanceName)
      .eq("channel_type", channelType)
      .maybeSingle()

    if (inboxError || !inbox) {
      console.log(`[Chatwoot Bridge] No Chatwoot inbox found for ${instanceName} (${channelType})`)
      return null
    }

    console.log(`[Chatwoot Bridge] Found Chatwoot inbox: ${inbox.chatwoot_inbox_id}`)

    // Create Chatwoot client
    const chatwoot = createChatwootClient()
    if (!chatwoot) {
      console.error("[Chatwoot Bridge] Chatwoot client not configured")
      return null
    }

    // Extract phone number
    const phoneNumber = messageData.from.replace("@s.whatsapp.net", "")

    // Find or create contact in Chatwoot
    const chatwootContact = await findOrCreateChatwootContact(
      chatwoot,
      supabase,
      userId,
      instanceName,
      phoneNumber,
      messageData.senderName,
      inbox.chatwoot_inbox_id,
    )

    if (!chatwootContact) {
      console.error("[Chatwoot Bridge] Failed to create/find contact")
      return null
    }

    // Find or create conversation in Chatwoot
    const chatwootConversation = await findOrCreateChatwootConversation(
      chatwoot,
      supabase,
      userId,
      instanceName,
      phoneNumber,
      chatwootContact.chatwoot_contact_id,
      inbox.chatwoot_inbox_id,
    )

    if (!chatwootConversation) {
      console.error("[Chatwoot Bridge] Failed to create/find conversation")
      return null
    }

    // Send message to Chatwoot
    await chatwoot.sendMessage({
      conversation_id: chatwootConversation.chatwoot_conversation_id,
      content: messageData.text,
      message_type: "incoming",
    })

    console.log(
      `[Chatwoot Bridge] Message forwarded to Chatwoot conversation: ${chatwootConversation.chatwoot_conversation_id}`,
    )

    return {
      contactId: chatwootContact.chatwoot_contact_id,
      conversationId: chatwootConversation.chatwoot_conversation_id,
    }
  } catch (error) {
    console.error("[Chatwoot Bridge] Failed to forward to Chatwoot:", error)
    return null
  }
}

async function findOrCreateChatwootContact(
  chatwoot: any,
  supabase: any,
  userId: string,
  instanceName: string,
  phoneNumber: string,
  senderName: string | undefined,
  inboxId: number,
) {
  try {
    // Check if contact exists in our database
    const { data: existingContact } = await supabase
      .from("chatwoot_contacts")
      .select("*")
      .eq("user_id", userId)
      .eq("instance_name", instanceName)
      .eq("phone_number", phoneNumber)
      .maybeSingle()

    if (existingContact) {
      console.log(`[Chatwoot Bridge] Found existing contact: ${existingContact.chatwoot_contact_id}`)
      return existingContact
    }

    // Search in Chatwoot
    const searchResult = await chatwoot.searchContact(phoneNumber)
    if (searchResult.payload && searchResult.payload.length > 0) {
      const chatwootContact = searchResult.payload[0]
      console.log(`[Chatwoot Bridge] Found contact in Chatwoot: ${chatwootContact.id}`)

      // Save to our database
      const { data: newContact } = await supabase
        .from("chatwoot_contacts")
        .insert({
          user_id: userId,
          instance_name: instanceName,
          phone_number: phoneNumber,
          chatwoot_contact_id: chatwootContact.id,
          chatwoot_account_id: Number.parseInt(process.env.CHATWOOT_ACCOUNT_ID!),
          contact_name: senderName || phoneNumber,
        })
        .select()
        .single()

      return newContact
    }

    // Create new contact in Chatwoot
    console.log(`[Chatwoot Bridge] Creating new contact in Chatwoot`)
    const chatwootContact = await chatwoot.createContact({
      inbox_id: inboxId,
      name: senderName || phoneNumber,
      phone_number: `+${phoneNumber}`,
    })

    // Save to our database
    const { data: newContact } = await supabase
      .from("chatwoot_contacts")
      .insert({
        user_id: userId,
        instance_name: instanceName,
        phone_number: phoneNumber,
        chatwoot_contact_id: chatwootContact.payload.contact.id,
        chatwoot_account_id: Number.parseInt(process.env.CHATWOOT_ACCOUNT_ID!),
        contact_name: senderName || phoneNumber,
      })
      .select()
      .single()

    console.log(`[Chatwoot Bridge] Created new contact: ${newContact.chatwoot_contact_id}`)
    return newContact
  } catch (error) {
    console.error("[Chatwoot Bridge] Failed to find/create contact:", error)
    return null
  }
}

async function findOrCreateChatwootConversation(
  chatwoot: any,
  supabase: any,
  userId: string,
  instanceName: string,
  phoneNumber: string,
  contactId: number,
  inboxId: number,
) {
  try {
    // Check if conversation exists in our database
    const { data: existingConversation } = await supabase
      .from("chatwoot_conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("instance_name", instanceName)
      .eq("phone_number", phoneNumber)
      .eq("status", "open")
      .maybeSingle()

    if (existingConversation) {
      console.log(`[Chatwoot Bridge] Found existing conversation: ${existingConversation.chatwoot_conversation_id}`)
      return existingConversation
    }

    // Create new conversation in Chatwoot
    console.log(`[Chatwoot Bridge] Creating new conversation in Chatwoot`)
    const chatwootConversation = await chatwoot.createConversation({
      contact_id: contactId,
      inbox_id: inboxId,
      status: "open",
    })

    // Save to our database
    const { data: newConversation } = await supabase
      .from("chatwoot_conversations")
      .insert({
        user_id: userId,
        instance_name: instanceName,
        phone_number: phoneNumber,
        chatwoot_conversation_id: chatwootConversation.id,
        chatwoot_inbox_id: inboxId,
        chatwoot_contact_id: contactId,
        status: "open",
      })
      .select()
      .single()

    console.log(`[Chatwoot Bridge] Created new conversation: ${newConversation.chatwoot_conversation_id}`)
    return newConversation
  } catch (error) {
    console.error("[Chatwoot Bridge] Failed to find/create conversation:", error)
    return null
  }
}

export async function forwardToWhatsApp(instanceName: string, message: string, phoneNumber: string) {
  try {
    console.log(`[Chatwoot Bridge] Forwarding message to WhatsApp for ${instanceName}`)

    const evolutionApiUrl = process.env.EVOLUTION_API_URL || "https://evolu.cetoloji.com"
    const evolutionApiKey = process.env.EVOLUTION_API_KEY || "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

    const response = await fetch(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: evolutionApiKey,
      },
      body: JSON.stringify({
        number: phoneNumber.includes("@") ? phoneNumber : `${phoneNumber}@s.whatsapp.net`,
        text: message,
      }),
    })

    if (!response.ok) {
      throw new Error(`Evolution API failed: ${response.status}`)
    }

    console.log(`[Chatwoot Bridge] Message forwarded to WhatsApp: ${phoneNumber}`)
    return true
  } catch (error) {
    console.error("[Chatwoot Bridge] Failed to forward to WhatsApp:", error)
    return false
  }
}
