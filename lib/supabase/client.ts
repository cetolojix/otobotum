import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Supabase environment variables missing:", {
      url: supabaseUrl ? "✓" : "✗ NEXT_PUBLIC_SUPABASE_URL",
      key: supabaseAnonKey ? "✓" : "✗ NEXT_PUBLIC_SUPABASE_ANON_KEY",
    })
    throw new Error("Supabase environment variables are missing. Please check your environment configuration.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
