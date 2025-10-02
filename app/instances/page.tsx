import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WhatsAppInstanceManager } from "@/components/whatsapp-instance-manager"

export default async function InstancesPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // First try to get profile by user ID
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  // If no profile found by user ID, try to find by email
  let finalProfile = profile
  if (!profile && user.email) {
    const { data: emailProfile } = await supabase.from("profiles").select("*").eq("email", user.email).maybeSingle()

    finalProfile = emailProfile
  }

  if (finalProfile?.role === "admin") {
    redirect("/admin")
  }

  // Fetch user's instances - use profile user_id if available, otherwise auth user id
  const instanceUserId = finalProfile?.id || user.id
  const { data: instances } = await supabase
    .from("instances")
    .select("*")
    .eq("user_id", instanceUserId)
    .order("created_at", { ascending: false })

  return <WhatsAppInstanceManager user={user} profile={finalProfile} instances={instances || []} />
}
