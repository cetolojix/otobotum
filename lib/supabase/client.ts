import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://simerjuazakhwqgmnwkf.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbWVyanVhemFraHdxZ21ud2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTI0MTAsImV4cCI6MjA1MTQ4ODQxMH0.t1_UEwxhcbN-wBt-1JE3r_dz-YnGdKqEzxCr-raBDow"

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
