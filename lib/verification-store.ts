import { createAdminClient } from "@/lib/supabase/admin"

export async function storeVerificationCode(phone: string, code: string) {
  console.log("[v0] STORING verification code:", code, "for phone:", phone)

  const adminSupabase = createAdminClient()

  // Önce mevcut kodu temizle
  await adminSupabase.from("verification_codes").delete().eq("phone", phone)

  // Yeni kodu ve süresini kaydet (10 dakika geçerli)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error } = await adminSupabase.from("verification_codes").insert({
    phone: phone,
    code: code,
    expires_at: expiresAt,
  })

  if (error) {
    console.error("[v0] Error storing verification code:", error)
    throw new Error("Doğrulama kodu kaydedilemedi")
  }

  console.log("[v0] Verification code stored successfully in database")
}

export async function getStoredVerificationCode(phone: string) {
  console.log("[v0] RETRIEVING code for phone:", phone)

  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from("verification_codes")
    .select("code, expires_at, created_at")
    .eq("phone", phone)
    .single()

  if (error || !data) {
    console.log("[v0] No verification code found for phone:", phone)
    return null
  }

  // Süre kontrolü
  const expiresAt = new Date(data.expires_at).getTime()
  const now = Date.now()

  if (now > expiresAt) {
    console.log("[v0] Verification code expired for phone:", phone)
    await deleteVerificationCode(phone)
    return null
  }

  console.log("[v0] RETRIEVED verification code from database")
  return {
    code: data.code,
    timestamp: new Date(data.created_at).getTime(),
  }
}

export async function deleteVerificationCode(phone: string) {
  console.log("[v0] DELETING verification code for phone:", phone)

  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase.from("verification_codes").delete().eq("phone", phone)

  if (error) {
    console.error("[v0] Error deleting verification code:", error)
  } else {
    console.log("[v0] Verification code deleted successfully from database")
  }
}
