import { type NextRequest, NextResponse } from "next/server"

const EVOLUTION_API_URL = "https://evolu.cetoloji.com"
const EVOLUTION_API_KEY = "hvsctnOWysGzOGHea8tEzV2iHCGr9H4L"

export async function POST(request: NextRequest) {
  try {
    const { instanceName, webhookUrl } = await request.json()

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 })
    }

    console.log(`[v0] Updating webhook for instance: ${instanceName}`)

    const defaultWebhookUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/whatsapp/${instanceName}`
      : `https://whatsappaiautomation2.vercel.app/api/webhooks/whatsapp/${instanceName}`

    const finalWebhookUrl = webhookUrl || defaultWebhookUrl

    const webhookPayload = {
      webhook: {
        enabled: true,
        url: finalWebhookUrl,
        webhookByEvents: false,
        webhookBase64: false,
        events: [
          "QRCODE_UPDATED",
          "MESSAGES_SET",
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE",
          "MESSAGES_DELETE",
          "CONNECTION_UPDATE",
          "PRESENCE_UPDATE",
          "CHATS_SET",
          "CHATS_UPSERT",
          "CHATS_UPDATE",
          "CHATS_DELETE",
          "CONTACTS_SET",
          "CONTACTS_UPSERT",
          "CONTACTS_UPDATE",
          "CALL",
        ],
      },
    }

    console.log(`[v0] Webhook payload:`, JSON.stringify(webhookPayload, null, 2))

    const response = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
      method: "POST",
      headers: {
        apikey: EVOLUTION_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    })

    console.log(`[v0] Webhook update response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`[v0] Webhook update error response:`, errorText)
      throw new Error(`Failed to update webhook: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`[v0] Webhook updated successfully:`, JSON.stringify(data, null, 2))

    return NextResponse.json({
      success: true,
      instanceName,
      webhook: data,
    })
  } catch (error) {
    console.error("[v0] Error updating webhook:", error)
    return NextResponse.json({ error: "Failed to update webhook" }, { status: 500 })
  }
}
