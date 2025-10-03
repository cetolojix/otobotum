import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  console.log("[v0] Checking Supabase environment variables...")
  console.log("[v0] SUPABASE_URL:", process.env.SUPABASE_URL ? "✓ Found" : "✗ Missing")
  console.log("[v0] SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "✓ Found" : "✗ Missing")
  console.log("[v0] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Found" : "✗ Missing")
  console.log(
    "[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Found" : "✗ Missing",
  )

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Final supabaseUrl:", supabaseUrl ? "✓ Set" : "✗ Not set")
  console.log("[v0] Final supabaseAnonKey:", supabaseAnonKey ? "✓ Set" : "✗ Not set")

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your project settings.",
    )
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
