"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string | null
    role?: string
    phone?: string | null
    username?: string | null
    address?: string | null
    city?: string | null
    district?: string | null
    company_name?: string | null
    company_address?: string | null
    company_tax_number?: string | null
    company_website?: string | null
    account_type?: string | null
  },
) {
  try {
    // Verify the current user is an admin
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Oturum bulunamadı" }
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return { error: "Bu işlem için admin yetkisi gereklidir" }
    }

    // Use admin client to update the profile
    const adminClient = createAdminClient()
    const { data, error } = await adminClient.from("profiles").update(updates).eq("id", userId).select().single()

    if (error) {
      console.error("[v0] Error updating user profile:", error)
      return { error: error.message }
    }

    revalidatePath("/admin")
    return { data, error: null }
  } catch (error) {
    console.error("[v0] Unexpected error updating user profile:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    // Verify the current user is an admin
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Oturum bulunamadı" }
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return { error: "Bu işlem için admin yetkisi gereklidir" }
    }

    // Use admin client to update the role
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating user role:", error)
      return { error: error.message }
    }

    revalidatePath("/admin")
    return { data, error: null }
  } catch (error) {
    console.error("[v0] Unexpected error updating user role:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}
