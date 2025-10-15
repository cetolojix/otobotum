import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createChatwootClient } from "@/lib/chatwoot"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  if (error) {
    console.error("[Instagram OAuth] Error:", error, errorDescription)
    return NextResponse.redirect(
      new URL(`/instances?error=${encodeURIComponent(errorDescription || error)}`, request.url),
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL("/instances?error=No authorization code received", request.url))
  }

  try {
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: "https://chatwoot.cetoloji.com/instagram/callback",
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      throw new Error(errorData.error_message || "Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()
    const { access_token, user_id } = tokenData

    const userResponse = await fetch(
      `https://graph.instagram.com/${user_id}?fields=id,username,account_type&access_token=${access_token}`,
    )

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Instagram user info")
    }

    const userData = await userResponse.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=Not authenticated", request.url))
    }

    const chatwoot = createChatwootClient()
    if (chatwoot) {
      try {
        const inbox = await chatwoot.createInbox({
          name: `Instagram - @${userData.username}`,
          channel: {
            type: "api",
            webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/api/chatwoot/instagram/webhook`,
          },
        })

        console.log("[Instagram OAuth] Chatwoot inbox created:", inbox.id)

        const { error: dbError } = await supabase.from("instagram_connections").upsert(
          {
            user_id: user.id,
            instagram_user_id: userData.id,
            instagram_username: userData.username,
            access_token: access_token,
            account_type: userData.account_type,
            chatwoot_inbox_id: inbox.id,
          },
          {
            onConflict: "user_id,instagram_user_id",
          },
        )

        if (dbError) {
          console.error("[Instagram OAuth] Database error:", dbError)
        }

        await supabase.from("chatwoot_inboxes").upsert(
          {
            instance_name: "global",
            channel_type: "instagram",
            chatwoot_inbox_id: inbox.id,
            chatwoot_account_id: 1,
            webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/api/chatwoot/instagram/webhook`,
          },
          {
            onConflict: "instance_name,channel_type",
          },
        )
      } catch (chatwootError) {
        console.error("[Instagram OAuth] Chatwoot error:", chatwootError)
        // Continue even if Chatwoot fails
      }
    }

    const { error: dbError } = await supabase.from("instagram_connections").upsert(
      {
        user_id: user.id,
        instagram_user_id: userData.id,
        instagram_username: userData.username,
        access_token: access_token,
        account_type: userData.account_type,
      },
      {
        onConflict: "user_id,instagram_user_id",
      },
    )

    if (dbError) {
      console.error("[Instagram OAuth] Database error:", dbError)
      throw new Error("Failed to save Instagram connection")
    }

    return NextResponse.redirect(
      new URL(`/instances?success=Instagram hesabı @${userData.username} başarıyla bağlandı`, request.url),
    )
  } catch (error: any) {
    console.error("[Instagram OAuth] Error:", error)
    return NextResponse.redirect(
      new URL(`/instances?error=${encodeURIComponent(error.message || "Instagram bağlantısı başarısız")}`, request.url),
    )
  }
}
