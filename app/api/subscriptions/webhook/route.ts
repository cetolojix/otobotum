// iyzico webhook handler for subscription events
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    console.log("[v0] iyzico webhook received:", payload)

    const supabase = await createClient()

    // Log the webhook event
    await supabase.from("iyzico_webhook_events").insert({
      event_type: payload.eventType || "unknown",
      subscription_reference_code: payload.subscriptionReferenceCode,
      payload,
      processed: false,
    })

    // Handle different event types
    switch (payload.eventType) {
      case "SUBSCRIPTION_ORDER_SUCCESS":
        // Subscription payment successful
        await supabase
          .from("user_subscriptions")
          .update({
            status: "active",
            is_trial: false,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          })
          .eq("iyzico_subscription_reference_code", payload.subscriptionReferenceCode)
        break

      case "SUBSCRIPTION_ORDER_FAILED":
        // Subscription payment failed
        await supabase
          .from("user_subscriptions")
          .update({
            status: "expired",
          })
          .eq("iyzico_subscription_reference_code", payload.subscriptionReferenceCode)
        break

      case "SUBSCRIPTION_CANCELLED":
        // Subscription cancelled
        await supabase
          .from("user_subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("iyzico_subscription_reference_code", payload.subscriptionReferenceCode)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
