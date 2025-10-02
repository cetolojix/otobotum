import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()

    console.log("[v0] Creating profile via API with data:", profileData)

    const { data: existingProfileById, error: checkByIdError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, phone")
      .eq("id", profileData.id)
      .maybeSingle()

    if (checkByIdError && checkByIdError.code !== "PGRST116") {
      console.error("[v0] Error checking existing profile by ID:", checkByIdError)
      return NextResponse.json({ error: "Database error", details: checkByIdError.message }, { status: 500 })
    }

    // If profile exists for this user ID, update it
    if (existingProfileById) {
      console.log("[v0] Profile already exists for user ID:", existingProfileById.id)

      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          email: profileData.email,
          full_name: profileData.full_name,
          username: profileData.username,
          city: profileData.city,
          address: profileData.address,
          company_name: profileData.company_name,
          company_address: profileData.company_address,
          company_tax_number: profileData.company_tax_number,
          company_website: profileData.company_website,
          account_type: profileData.account_type,
          role: profileData.role,
          phone: profileData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProfileById.id)
        .select()
        .single()

      if (updateError) {
        console.error("[v0] Profile update error:", updateError)
        return NextResponse.json({ error: "Profile update failed", details: updateError.message }, { status: 500 })
      }

      console.log("[v0] Profile updated successfully:", updatedProfile)
      return NextResponse.json({
        success: true,
        profile: updatedProfile,
        action: "updated",
        message: "Profile updated with new information",
      })
    }

    // Check if profile exists with same phone number
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, phone")
      .eq("phone", profileData.phone)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[v0] Error checking existing profile:", checkError)
      return NextResponse.json({ error: "Database error", details: checkError.message }, { status: 500 })
    }

    if (existingProfile) {
      console.log("[v0] Profile with this phone already exists:", existingProfile.id)

      // and update the old profile to remove phone conflict
      const { data: updatedOldProfile } = await supabaseAdmin
        .from("profiles")
        .update({
          phone: null, // Remove phone from old profile to avoid conflict
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProfile.id)
        .select()
        .single()

      console.log("[v0] Removed phone from old profile:", updatedOldProfile)

      // Now create new profile with correct user ID
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from("profiles")
        .insert([profileData])
        .select()
        .single()

      if (createError) {
        console.error("[v0] Profile creation error:", createError)
        return NextResponse.json({ error: "Profile creation failed", details: createError.message }, { status: 500 })
      }

      console.log("[v0] New profile created successfully:", newProfile)
      return NextResponse.json({
        success: true,
        profile: newProfile,
        action: "created",
        message: "New profile created successfully",
      })
    }

    // Create new profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([profileData])
      .select()
      .single()

    if (profileError) {
      console.error("[v0] Profile creation error via API:", profileError)
      return NextResponse.json({ error: "Profile creation failed", details: profileError.message }, { status: 500 })
    }

    console.log("[v0] Profile created successfully via API:", profile)
    return NextResponse.json({
      success: true,
      profile,
      action: "created",
      message: "New profile created successfully",
    })
  } catch (error) {
    console.error("[v0] Profile creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
