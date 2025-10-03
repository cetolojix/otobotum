import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { iyzicoClient } from "@/lib/iyzico/client"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get("token") as string

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed`)
    }

    // Retrieve payment details from iyzico
    const paymentResult = await iyzicoClient.retrieveCheckoutForm(token)

    const supabase = await createClient()

    // Find transaction by payment_id
    const { data: transaction } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("payment_id", token)
      .single()

    if (!transaction) {
      console.error("[v0] Transaction not found for token:", token)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed`)
    }

    // Update transaction status
    const isSuccess = paymentResult.status === "success" && paymentResult.paymentStatus === "SUCCESS"

    await supabase
      .from("payment_transactions")
      .update({
        payment_status: isSuccess ? "success" : "failed",
        iyzico_response: paymentResult,
        paid_at: isSuccess ? new Date().toISOString() : null,
        error_message: isSuccess ? null : paymentResult.errorMessage,
        card_family: paymentResult.cardFamily,
        card_association: paymentResult.cardAssociation,
        card_last_four: paymentResult.lastFourDigits,
      })
      .eq("id", transaction.id)

    if (isSuccess) {
      // Calculate expiration date
      const expiresAt = new Date()
      if (transaction.billing_cycle === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1)
      }

      // Update or create user subscription
      await supabase.from("user_subscriptions").upsert(
        {
          user_id: transaction.user_id,
          package_id: transaction.package_id,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          auto_renew: true,
          payment_method: "iyzico",
          last_payment_at: new Date().toISOString(),
          is_trial: false,
        },
        {
          onConflict: "user_id",
        },
      )

      // Mark trial as used
      await supabase.from("trial_periods").update({ is_trial_used: true }).eq("user_id", transaction.user_id)

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`)
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed`)
    }
  } catch (error) {
    console.error("[v0] Error in payment callback:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed`)
  }
}
