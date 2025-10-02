"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Send, Loader2, Phone, Tag, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

interface Message {
  id: string
  conversation_id: string
  content: string
  is_from_bot: boolean
  handled_by: string
  operator_id: string | null
  timestamp: string
  sender_phone: string | null
  recipient_phone: string | null
}

interface Conversation {
  id: string
  instance_id: string
  customer_phone: string
  customer_name: string | null
  status: string
  ai_enabled: boolean
  assigned_operator: string | null
  tags: string[]
  last_message_at: string
  unread_count: number
  instance_name: string
  operator_name: string | null
  total_messages: number
  human_handled_messages: number
}

interface MessageListProps {
  conversation: Conversation
  onInterventionClick?: () => void
}

export function MessageList({ conversation, onInterventionClick }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!conversation.customer_phone || !conversation.instance_name) {
      console.error("[v0] Missing required conversation data!")
      return
    }

    fetchMessages()

    const interval = setInterval(() => {
      fetchMessages(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [conversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setLoading(true)
    }
    try {
      const remoteJid = conversation.customer_phone.includes("@")
        ? conversation.customer_phone
        : `${conversation.customer_phone}@s.whatsapp.net`

      const response = await fetch("/api/evolution/fetch-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          instanceName: conversation.instance_name,
          remoteJid: remoteJid,
          limit: 100,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.messages) {
          setMessages(data.messages)
        }
      } else {
        const errorText = await response.text()
        console.error("[v0] Failed to fetch messages:", response.status, errorText)
      }
    } catch (error) {
      console.error("[v0] Error fetching messages:", error)
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false)
      }
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMessages()
    setRefreshing(false)
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch("/api/conversations/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceName: conversation.instance_name,
          customerPhone: conversation.customer_phone,
          message: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-full rounded-lg border border-gray-800 bg-gray-900/50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg font-semibold">
              {conversation.customer_name?.[0]?.toUpperCase() || conversation.customer_phone[0]}
            </div>
            <div>
              <div className="font-semibold">{conversation.customer_name || conversation.customer_phone}</div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {conversation.customer_phone}
                <span className="text-gray-600">•</span>
                <span>{conversation.instance_name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              size="sm"
              variant="outline"
              className="border-gray-700 hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {conversation.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {conversation.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs border-gray-700 text-gray-400">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Henüz mesaj yok</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.is_from_bot ? "justify-start" : "justify-end"}`}>
                <div className={`flex gap-3 max-w-[70%] ${message.is_from_bot ? "" : "flex-row-reverse"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.is_from_bot ? "bg-blue-500/20 text-blue-500" : "bg-purple-500/20 text-purple-500"
                    }`}
                  >
                    {message.is_from_bot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.is_from_bot ? "bg-gray-800 text-white" : "bg-blue-600 text-white"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(message.timestamp), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                      {message.handled_by && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs border-gray-700">
                            {message.handled_by === "ai" ? "AI" : message.handled_by === "human" ? "İnsan" : "Sistem"}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-800 p-4 flex-shrink-0">
        <div className="flex gap-3">
          <Textarea
            placeholder="Mesajınızı yazın..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="flex-1 min-h-[60px] max-h-[120px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700 self-end"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
