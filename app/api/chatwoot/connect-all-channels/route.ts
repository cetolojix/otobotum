import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createChatwootClient } from "@/lib/chatwoot"
import { debugLog } from "@/lib/debug"

export async function POST(request: NextRequest) {
  try {
    const { instanceName } = await request.json()

    const effectiveInstanceName = instanceName || "global"

    if (!effectiveInstanceName) {
      return NextResponse.json({ error: "Instance name gerekli" }, { status: 400 })
    }

    debugLog("[Chatwoot] Tüm kanallar bağlanıyor:", effectiveInstanceName)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const chatwoot = createChatwootClient()
    if (!chatwoot) {
      return NextResponse.json({ error: "Chatwoot yapılandırılmamış" }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"
    const createdInboxes = []

    // 1. WhatsApp API Channel
    try {
      const whatsappInbox = await chatwoot.createInbox({
        name: `WhatsApp - ${effectiveInstanceName}`,
        channel: {
          type: "api",
          webhook_url: `${siteUrl}/api/chatwoot/webhook/${effectiveInstanceName}`,
        },
      })

      await supabase.from("chatwoot_inboxes").upsert(
        {
          user_id: user.id,
          instance_name: effectiveInstanceName,
          chatwoot_inbox_id: whatsappInbox.id,
          chatwoot_account_id: 1,
          inbox_name: whatsappInbox.name,
          channel_type: "whatsapp",
          webhook_url: `${siteUrl}/api/chatwoot/webhook/${effectiveInstanceName}`,
        },
        {
          onConflict: "user_id,instance_name",
        },
      )

      createdInboxes.push({ channel: "WhatsApp", inbox_id: whatsappInbox.id })
      debugLog("[Chatwoot] WhatsApp inbox oluşturuldu:", whatsappInbox.id)
    } catch (error) {
      debugLog("[Chatwoot] WhatsApp inbox hatası:", error)
    }

    // 2. Instagram API Channel
    try {
      const instagramInbox = await chatwoot.createInbox({
        name: `Instagram - ${effectiveInstanceName}`,
        channel: {
          type: "api",
          webhook_url: `${siteUrl}/api/chatwoot/instagram/webhook`,
        },
      })

      await supabase.from("chatwoot_inboxes").upsert(
        {
          user_id: user.id,
          instance_name: `${effectiveInstanceName}-instagram`,
          chatwoot_inbox_id: instagramInbox.id,
          chatwoot_account_id: 1,
          inbox_name: instagramInbox.name,
          channel_type: "instagram",
          webhook_url: `${siteUrl}/api/chatwoot/instagram/webhook`,
        },
        {
          onConflict: "user_id,instance_name",
        },
      )

      createdInboxes.push({ channel: "Instagram", inbox_id: instagramInbox.id })
      debugLog("[Chatwoot] Instagram inbox oluşturuldu:", instagramInbox.id)
    } catch (error) {
      debugLog("[Chatwoot] Instagram inbox hatası:", error)
    }

    // 3. Telegram API Channel
    try {
      const telegramInbox = await chatwoot.createInbox({
        name: `Telegram - ${effectiveInstanceName}`,
        channel: {
          type: "api",
          webhook_url: `${siteUrl}/api/chatwoot/telegram/webhook`,
        },
      })

      await supabase.from("chatwoot_inboxes").upsert(
        {
          user_id: user.id,
          instance_name: `${effectiveInstanceName}-telegram`,
          chatwoot_inbox_id: telegramInbox.id,
          chatwoot_account_id: 1,
          inbox_name: telegramInbox.name,
          channel_type: "telegram",
          webhook_url: `${siteUrl}/api/chatwoot/telegram/webhook`,
        },
        {
          onConflict: "user_id,instance_name",
        },
      )

      createdInboxes.push({ channel: "Telegram", inbox_id: telegramInbox.id })
      debugLog("[Chatwoot] Telegram inbox oluşturuldu:", telegramInbox.id)
    } catch (error) {
      debugLog("[Chatwoot] Telegram inbox hatası:", error)
    }

    // 4. Web Chat Widget
    try {
      const webChatInbox = await chatwoot.createInbox({
        name: `Web Chat - ${effectiveInstanceName}`,
        channel: {
          type: "api",
          webhook_url: `${siteUrl}/api/chatwoot/webhook/${effectiveInstanceName}`,
        },
      })

      await supabase.from("chatwoot_inboxes").upsert(
        {
          user_id: user.id,
          instance_name: `${effectiveInstanceName}-webchat`,
          chatwoot_inbox_id: webChatInbox.id,
          chatwoot_account_id: 1,
          inbox_name: webChatInbox.name,
          channel_type: "webchat",
          webhook_url: `${siteUrl}/api/chatwoot/webhook/${effectiveInstanceName}`,
        },
        {
          onConflict: "user_id,instance_name",
        },
      )

      createdInboxes.push({ channel: "Web Chat", inbox_id: webChatInbox.id })
      debugLog("[Chatwoot] Web Chat inbox oluşturuldu:", webChatInbox.id)
    } catch (error) {
      debugLog("[Chatwoot] Web Chat inbox hatası:", error)
    }

    try {
      await chatwoot.createWebhook(`${siteUrl}/api/chatwoot/webhook/${effectiveInstanceName}`, [
        "message_created",
        "conversation_created",
        "conversation_updated",
      ])
      debugLog("[Chatwoot] Account webhook oluşturuldu")
    } catch (error) {
      // Webhook already exists, ignore error
      debugLog("[Chatwoot] Account webhook zaten mevcut veya hata:", error)
    }

    return NextResponse.json({
      success: true,
      message: `${createdInboxes.length} kanal başarıyla bağlandı`,
      inboxes: createdInboxes,
    })
  } catch (error) {
    debugLog("[Chatwoot] Kanal bağlama hatası:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Kanallar bağlanırken hata oluştu",
      },
      { status: 500 },
    )
  }
}
