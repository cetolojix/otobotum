import { createClient } from "@/lib/supabase/server"
import { createChatwootClient } from "@/lib/chatwoot"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { instanceName } = await request.json()

    if (!instanceName) {
      return NextResponse.json({ error: "Instance adı gerekli" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if inbox already exists
    const { data: existingInbox } = await supabase
      .from("chatwoot_inboxes")
      .select("*")
      .eq("user_id", user.id)
      .eq("instance_name", instanceName)
      .maybeSingle()

    if (existingInbox) {
      return NextResponse.json({ error: "Bu instance için zaten bir inbox mevcut" }, { status: 400 })
    }

    // Create Chatwoot client
    const chatwoot = createChatwootClient()
    if (!chatwoot) {
      return NextResponse.json({ error: "Chatwoot yapılandırması başarısız oldu" }, { status: 500 })
    }

    // Create webhook URL
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/api/chatwoot/webhook/${instanceName}`

    // Create inbox in Chatwoot
    const chatwootInbox = await chatwoot.createInbox({
      name: `WhatsApp - ${instanceName}`,
      channel: {
        type: "api",
        webhook_url: webhookUrl,
      },
    })

    // Save to database
    const { data: inbox, error: dbError } = await supabase
      .from("chatwoot_inboxes")
      .insert({
        user_id: user.id,
        instance_name: instanceName,
        chatwoot_inbox_id: chatwootInbox.id,
        chatwoot_account_id: Number.parseInt(process.env.CHATWOOT_ACCOUNT_ID!),
        inbox_name: chatwootInbox.name,
        channel_type: "api",
        webhook_url: webhookUrl,
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({ inbox })
  } catch (error: any) {
    console.error("Failed to create Chatwoot inbox:", error)
    return NextResponse.json({ error: error.message || "Inbox oluşturulamadı" }, { status: 500 })
  }
}
