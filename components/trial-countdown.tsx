"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TrialCountdownProps {
  language?: string
}

export function TrialCountdown({ language = "tr" }: TrialCountdownProps) {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        const { data: trial } = await supabase.from("trial_periods").select("*").eq("user_id", user.id).maybeSingle()

        if (trial && trial.is_active) {
          const now = new Date()
          const endsAt = new Date(trial.ends_at)
          const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          setTrialDaysLeft(daysLeft)
        }
      } catch (error) {
        console.error("[v0] Error fetching trial status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrialStatus()

    // Update every hour
    const interval = setInterval(fetchTrialStatus, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [supabase])

  if (loading || trialDaysLeft === null) {
    return null
  }

  const isExpiringSoon = trialDaysLeft <= 2
  const text =
    language === "tr" ? `Deneme süresi: ${trialDaysLeft} gün kaldı` : `Trial period: ${trialDaysLeft} days left`

  return (
    <Badge
      variant={isExpiringSoon ? "destructive" : "secondary"}
      className="gap-2 px-3 py-1.5 font-medium animate-pulse"
    >
      {isExpiringSoon ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      {text}
    </Badge>
  )
}
