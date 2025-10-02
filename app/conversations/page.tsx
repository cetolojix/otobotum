import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ConversationPanel } from "@/components/conversation-panel"

export default async function ConversationsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  console.log("[v0] Conversations page - User ID:", user?.id)

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  console.log("[v0] Conversations page - Profile:", profile)

  const { data: instances, error: instancesError } = await supabase
    .from("instances")
    .select("id, instance_name, status")
    .eq("user_id", user.id)
    .eq("platform", "whatsapp")
    .order("created_at", { ascending: false })

  console.log("[v0] Conversations page - Instances:", instances)
  console.log("[v0] Conversations page - Instances error:", instancesError)

  const transformedInstances =
    instances?.map((i) => ({
      id: i.id,
      instance_name: i.instance_name,
      status: i.status,
    })) || []

  console.log("[v0] Conversations page - Transformed instances:", transformedInstances)

  return (
    <ConversationPanel
      user={user}
      profile={profile}
      instances={transformedInstances}
      initialConversations={[]} // Empty - will be fetched from Evolution API
    />
  )
}
