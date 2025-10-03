import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/auth"

export interface SubscriptionStatus {
  hasAccess: boolean
  isInTrial: boolean
  trialDaysLeft: number
  subscription: any
  needsUpgrade: boolean
}

export async function checkSubscriptionAccess(): Promise<SubscriptionStatus> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      hasAccess: false,
      isInTrial: false,
      trialDaysLeft: 0,
      subscription: null,
      needsUpgrade: true,
    }
  }

  const profile = await getUserProfile(user.id)
  if (profile?.role === "admin") {
    console.log("[v0] Admin user detected - bypassing subscription check")
    return {
      hasAccess: true,
      isInTrial: false,
      trialDaysLeft: 0,
      subscription: null,
      needsUpgrade: false,
    }
  }

  const { data: trial } = await supabase.from("trial_periods").select("*").eq("user_id", user.id).maybeSingle()

  const now = new Date()
  const isInTrial = trial && trial.is_active && new Date(trial.ends_at) > now
  const trialDaysLeft =
    trial && trial.is_active
      ? Math.max(0, Math.ceil((new Date(trial.ends_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0

  // If in trial, user has access
  if (isInTrial) {
    return {
      hasAccess: true,
      isInTrial: true,
      trialDaysLeft,
      subscription: null,
      needsUpgrade: false,
    }
  }

  // Check active subscription
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select(
      `
      *,
      packages (*)
    `,
    )
    .eq("user_id", user.id)
    .maybeSingle()

  if (!subscription) {
    return {
      hasAccess: false,
      isInTrial: false,
      trialDaysLeft: 0,
      subscription: null,
      needsUpgrade: true,
    }
  }

  // Check if subscription is active and not expired
  const isActive = subscription.status === "active"
  const isExpired = subscription.expires_at && new Date(subscription.expires_at) < now

  if (isActive && !isExpired) {
    return {
      hasAccess: true,
      isInTrial: false,
      trialDaysLeft: 0,
      subscription,
      needsUpgrade: false,
    }
  }

  // Subscription expired or inactive
  return {
    hasAccess: false,
    isInTrial: false,
    trialDaysLeft: 0,
    subscription,
    needsUpgrade: true,
  }
}

export async function initializeTrialForNewUser(userId: string) {
  const supabase = await createClient()

  // Check if trial already exists
  const { data: existingTrial } = await supabase.from("trial_periods").select("*").eq("user_id", userId).maybeSingle()

  if (existingTrial) {
    return existingTrial
  }

  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 7)

  const { data: trial, error } = await supabase
    .from("trial_periods")
    .insert({
      user_id: userId,
      started_at: new Date().toISOString(),
      ends_at: trialEndDate.toISOString(),
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating trial period:", error)
    return null
  }

  const { data: starterPackage } = await supabase.from("packages").select("id").eq("name", "starter").single()

  if (starterPackage) {
    await supabase.from("user_subscriptions").upsert({
      user_id: userId,
      package_id: starterPackage.id,
      status: "active",
      trial_start: new Date().toISOString(),
      trial_end: trialEndDate.toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: trialEndDate.toISOString(),
    })
  }

  return trial
}

export async function checkAndExpireSubscriptions() {
  const supabase = await createClient()

  const now = new Date().toISOString()

  // Find expired subscriptions
  const { data: expiredSubs } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("status", "active")
    .lt("expires_at", now)

  if (expiredSubs && expiredSubs.length > 0) {
    // Update expired subscriptions
    const expiredIds = expiredSubs.map((sub) => sub.id)

    await supabase
      .from("user_subscriptions")
      .update({
        status: "expired",
        updated_at: now,
      })
      .in("id", expiredIds)

    console.log(`[v0] Expired ${expiredIds.length} subscriptions`)
  }

  return expiredSubs?.length || 0
}
