"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting login with email:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login response:", { data, error })

      if (error) {
        console.log("[v0] Login error:", error.message)

        if (error.message === "Invalid login credentials") {
          setError("Email veya şifre hatalı. Lütfen tekrar deneyin.")
        } else {
          setError(error.message)
        }
        return
      }

      console.log("[v0] Login successful, redirecting to instances")
      router.push("/instances")
    } catch (error: unknown) {
      console.log("[v0] Login catch error:", error)
      setError(error instanceof Error ? error.message : "Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      {/* Navigation */}
      <Navigation />

      <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center p-6 md:p-10 relative z-10">
        <div className="absolute top-20 left-10 w-4 h-4 bg-neon-cyan rounded-full floating-element opacity-80 shadow-lg shadow-neon-cyan/50"></div>
        <div className="absolute top-40 right-20 w-6 h-6 border-2 border-neon-purple rounded-full floating-element opacity-70 shadow-lg shadow-neon-purple/30"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-tech-orange rounded-full floating-element opacity-80 shadow-lg shadow-tech-orange/50"></div>

        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card className="hologram-card shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl neon-text">Giriş Yap</CardTitle>
                <CardDescription>Hesabınıza giriş yapmak için email ve şifrenizi girin</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {error && (
                      <div className="text-sm text-red-500">
                        <p>{error}</p>
                      </div>
                    )}
                    <Button type="submit" className="w-full tech-button" disabled={isLoading}>
                      {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Hesabınız yok mu?{" "}
                    <Link
                      href="/auth/register"
                      className="text-neon-cyan hover:text-neon-blue transition-colors underline underline-offset-4"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
