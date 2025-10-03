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

  // Check trial period
  const { data: trial } = await supabase.from("trial_periods").select("*").eq("user_id", user.id).maybeSingle()

  const now = new Date()
  const isInTrial = trial && new Date(trial.trial_end_date) > now && !trial.is_trial_used
  const trialDaysLeft = trial
    ? Math.max(0, Math.ceil((new Date(trial.trial_end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
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
  const { data: existingTrial } = await supabase.from("trial_periods").select("*").eq("user_id", userId).single()

  if (existingTrial) {
    return existingTrial
  }

  // Create trial period (7 days)
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 7)

  const { data: trial, error } = await supabase
    .from("trial_periods")
    .insert({
      user_id: userId,
      trial_start_date: new Date().toISOString(),
      trial_end_date: trialEndDate.toISOString(),
      is_trial_used: false,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating trial period:", error)
    return null
  }

  // Also assign basic package during trial
  const { data: basicPackage } = await supabase.from("packages").select("id").eq("name", "basic").single()

  if (basicPackage) {
    await supabase.from("user_subscriptions").upsert({
      user_id: userId,
      package_id: basicPackage.id,
      status: "active",
      is_trial: true,
      trial_ends_at: trialEndDate.toISOString(),
      started_at: new Date().toISOString(),
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
