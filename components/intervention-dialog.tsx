"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserCircle, Bot } from "lucide-react"

interface InterventionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversation: {
    id: string
    customer_name: string | null
    customer_phone: string
    ai_enabled: boolean
    instance_name: string
  }
  operators: Array<{
    id: string
    full_name: string
    email: string
  }>
  onSuccess: () => void
}

export function InterventionDialog({
  open,
  onOpenChange,
  conversation,
  operators,
  onSuccess,
}: InterventionDialogProps) {
  const [selectedOperator, setSelectedOperator] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleStartIntervention = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/conversations/toggle-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          aiEnabled: false,
          operatorId: selectedOperator || null,
          customerPhone: conversation.customer_phone,
          instanceName: conversation.instance_name,
          customerName: conversation.customer_name,
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        console.error("[v0] Error starting intervention:", errorData)
      }
    } catch (error) {
      console.error("Error starting intervention:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStopIntervention = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/conversations/toggle-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          aiEnabled: true,
          customerPhone: conversation.customer_phone,
          instanceName: conversation.instance_name,
          customerName: conversation.customer_name,
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        console.error("[v0] Error stopping intervention:", errorData)
      }
    } catch (error) {
      console.error("Error stopping intervention:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {conversation.ai_enabled ? (
              <>
                <UserCircle className="h-5 w-5 text-orange-500" />
                İnsan Müdahalesi Başlat
              </>
            ) : (
              <>
                <Bot className="h-5 w-5 text-green-500" />
                AI'ya Geri Dön
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {conversation.ai_enabled
              ? "AI'yı durdurup manuel olarak müşteriye yanıt verin. İsterseniz bir operatör atayabilirsiniz."
              : "Manuel müdahaleyi sonlandırırsanız, AI tekrar devreye girecek ve müşteri mesajlarına otomatik yanıt verecektir."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Müşteri Bilgileri</Label>
            <div className="bg-gray-800 rounded-lg p-3 space-y-1">
              <div className="text-sm">
                <span className="text-gray-400">İsim:</span>{" "}
                <span className="font-medium">{conversation.customer_name || "Belirtilmemiş"}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Telefon:</span>{" "}
                <span className="font-medium">{conversation.customer_phone}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Durum:</span>{" "}
                <Badge
                  className={
                    conversation.ai_enabled ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                  }
                >
                  {conversation.ai_enabled ? "AI Aktif" : "Manuel Mod"}
                </Badge>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Örnek Adı:</span>{" "}
                <span className="font-medium">{conversation.instance_name}</span>
              </div>
            </div>
          </div>

          {conversation.ai_enabled && (
            <div className="space-y-2">
              <Label htmlFor="operator" className="text-gray-300">
                Operatör Seçin (Opsiyonel)
              </Label>
              <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                <SelectTrigger id="operator" className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Operatör seçmeden devam edebilirsiniz..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id} className="text-white">
                      {operator.full_name} ({operator.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Operatör seçerseniz, bu konuşmadan sorumlu olacak ve gelen mesajlar kendisine bildirilecek
              </p>
            </div>
          )}

          {!conversation.ai_enabled && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <p className="text-sm text-orange-400">
                Manuel müdahaleyi sonlandırırsanız, AI tekrar devreye girecek ve müşteri mesajlarına otomatik yanıt
                verecektir.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-700 hover:bg-gray-800 bg-transparent"
          >
            İptal
          </Button>
          {conversation.ai_enabled ? (
            <Button onClick={handleStartIntervention} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCircle className="h-4 w-4 mr-2" />}
              Müdahaleyi Başlat
            </Button>
          ) : (
            <Button onClick={handleStopIntervention} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
              AI'ya Devret
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
