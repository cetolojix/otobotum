import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfilePage } from "@/components/profile-page"

export default async function Profile() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  // If profile doesn't exist, create it
  if (!profile && !profileError) {
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "",
        role: "user",
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating profile:", insertError)
      redirect("/auth/login")
    }

    profile = newProfile
  }

  if (!profile) {
    redirect("/auth/login")
  }

  return <ProfilePage user={user} profile={profile} />
}
