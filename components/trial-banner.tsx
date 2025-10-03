"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function TrialBanner() {
  const [trialInfo, setTrialInfo] = useState<{ isInTrial: boolean; daysLeft: number } | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchTrialStatus()
  }, [])

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch("/api/user/subscription-status")
      const data = await response.json()

      if (data.isInTrial && data.trial) {
        const daysLeft = Math.ceil((new Date(data.trial.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        setTrialInfo({ isInTrial: true, daysLeft })
      }
    } catch (error) {
      console.error("[v0] Error fetching trial status:", error)
    }
  }

  if (!trialInfo?.isInTrial || dismissed || trialInfo.daysLeft <= 0) {
    return null
  }

  return (
    <Alert className="border-blue-500 bg-blue-50 relative">
      <Calendar className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>Deneme süreniz aktif!</strong> {trialInfo.daysLeft} gün sonra deneme süreniz sona erecek.
          <Button
            variant="link"
            className="p-0 h-auto ml-1 text-blue-700 underline"
            onClick={() => router.push("/subscription")}
          >
            Şimdi yükselt
          </Button>
        </span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setDismissed(true)}>
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
