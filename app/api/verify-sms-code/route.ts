import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getStoredVerificationCode, deleteVerificationCode } from "@/lib/verification-store"

export async function POST(request: NextRequest) {
  try {
    const { phone, code, fullName, email, password } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: "Telefon numarası ve kod gerekli" }, { status: 400 })
    }

    console.log("[v0] Verifying SMS code:", code, "for phone:", phone, "with email:", email)

    const storedData = await getStoredVerificationCode(phone)

    if (!storedData) {
      console.log("[v0] No verification code found for phone:", phone)
      return NextResponse.json({ error: "Doğrulama kodu bulunamadı" }, { status: 400 })
    }

    // Kod süresi kontrolü (10 dakika)
    const now = Date.now()
    const codeAge = now - storedData.timestamp
    const maxAge = 10 * 60 * 1000 // 10 dakika

    if (codeAge > maxAge) {
      console.log("[v0] Verification code expired for phone:", phone)
      await deleteVerificationCode(phone)
      return NextResponse.json({ error: "Doğrulama kodu süresi dolmuş" }, { status: 400 })
    }

    // Kod kontrolü
    if (storedData.code !== code) {
      console.log("[v0] Invalid verification code for phone:", phone)
      return NextResponse.json({ error: "Geçersiz doğrulama kodu" }, { status: 400 })
    }

    if (fullName && password && email) {
      try {
        const supabase = await createClient()
        const adminSupabase = createAdminClient()

        console.log("[v0] Creating user with signUp:", { email, fullName })

        // Normal signUp kullan
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (signUpError) {
          console.error("[v0] SignUp error:", signUpError.message)

          if (signUpError.message.includes("User already registered")) {
            return NextResponse.json(
              {
                error: "Bu email adresi zaten kullanılıyor. Lütfen giriş yapın.",
              },
              { status: 400 },
            )
          }

          return NextResponse.json(
            {
              error: "Kullanıcı oluşturulamadı: " + signUpError.message,
            },
            { status: 500 },
          )
        }

        console.log("[v0] User signed up successfully:", signUpData.user?.id)

        if (signUpData.user) {
          // Admin client ile email_confirmed_at update et
          const { error: confirmError } = await adminSupabase.auth.admin.updateUserById(signUpData.user.id, {
            email_confirm: true,
          })

          if (confirmError) {
            console.error("[v0] Email confirmation error:", confirmError)
          } else {
            console.log("[v0] Email confirmed successfully")
          }

          // Profile oluştur veya güncelle
          const { error: profileError } = await adminSupabase.from("profiles").upsert(
            [
              {
                id: signUpData.user.id,
                email: email,
                full_name: fullName,
                phone: phone,
                role: "user",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
            { onConflict: "id" },
          )

          if (profileError) {
            console.error("[v0] Profile creation error:", profileError)
          } else {
            console.log("[v0] Profile created successfully")
          }

          // Trial period oluştur
          const trialEndDate = new Date()
          trialEndDate.setDate(trialEndDate.getDate() + 3)

          const { error: trialError } = await adminSupabase.from("trial_periods").insert([
            {
              user_id: signUpData.user.id,
              started_at: new Date().toISOString(),
              ends_at: trialEndDate.toISOString(),
              is_active: true,
              created_at: new Date().toISOString(),
            },
          ])

          if (trialError) {
            console.error("[v0] Trial period creation error:", trialError)
          } else {
            console.log("[v0] Trial period created successfully")
          }

          console.log("[v0] User created successfully, deleting verification code")
          await deleteVerificationCode(phone)

          console.log("[v0] Returning login credentials")
          return NextResponse.json({
            success: true,
            message: "Telefon numarası doğrulandı ve hesap oluşturuldu",
            loginCredentials: {
              email: email,
              password: password,
            },
          })
        }
      } catch (dbError) {
        console.error("[v0] Database error:", dbError)
        return NextResponse.json({ error: "Veritabanı hatası" }, { status: 500 })
      }
    }

    console.log("[v0] SMS verification successful for phone:", phone, "(code not deleted)")

    return NextResponse.json({
      success: true,
      message: "Telefon numarası doğrulandı",
    })
  } catch (error) {
    console.error("[v0] Verification API error:", error)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
