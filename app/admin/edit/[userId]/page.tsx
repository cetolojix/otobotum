import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditUserForm } from "@/components/edit-user-form"

export default async function EditUserPage({ params }: { params: { userId: string } }) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    redirect("/")
  }

  const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

  if (!currentProfile || currentProfile.role !== "admin") {
    redirect("/instances")
  }

  // Get the user to edit
  const { data: userToEdit, error } = await supabase.from("profiles").select("*").eq("id", params.userId).single()

  if (error || !userToEdit) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-background">
      <EditUserForm user={userToEdit} />
    </div>
  )
}
