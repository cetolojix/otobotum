"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { LogOut, Search, MessageSquare, User, RefreshCw, Bot } from "lucide-react"
import { MessageList } from "./message-list"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

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
  created_at: string
  instance_name: string
  operator_name: string | null
  total_messages: number
  human_handled_messages: number
  last_message: string | null
}

interface Instance {
  id: string
  instance_name: string
  status: string
}

interface ConversationPanelProps {
  user: any
  profile: any
  instances: Instance[]
  initialConversations: Conversation[]
}

export function ConversationPanel({ user, profile, instances, initialConversations }: ConversationPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [instanceFilter, setInstanceFilter] = useState("all")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    fetchChatsFromEvolution()

    const selectedId = searchParams.get("selected")
    if (selectedId) {
      const conv = conversations.find((c) => c.id === selectedId)
      if (conv) {
        setSelectedConversation(conv)
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchChatsFromEvolution()
    }, 5000)

    return () => clearInterval(interval)
  }, [instances])

  const fetchChatsFromEvolution = async () => {
    if (instances.length === 0) {
      return
    }

    try {
      const allChats: Conversation[] = []

      for (const instance of instances) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000)

          const response = await fetch(`/api/evolution/fetch-chats?instanceName=${instance.instance_name}`, {
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.chats) {
              allChats.push(...data.chats)
            }
          }
        } catch (fetchError: any) {
          // Silent error handling for auto-refresh
          console.error("[v0] Fetch error for instance:", instance.instance_name, fetchError.message || fetchError)
        }
      }

      setConversations(allChats)
    } catch (error: any) {
      console.error("[v0] Error fetching chats:", error.message || error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleProfile = () => {
    router.push("/profile")
  }

  const handleDashboard = () => {
    router.push("/instances")
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.customer_name && conv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || conv.status === statusFilter
    const matchesInstance = instanceFilter === "all" || conv.instance_name === instanceFilter

    return matchesSearch && matchesStatus && matchesInstance
  })

  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/90 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/30">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-bold neon-text">WhatsApp Yapay Zeka</span>
                <div className="text-xs text-muted-foreground font-medium hidden sm:block">Otomasyon Platformu</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-muted-foreground font-medium hidden md:block">
                Hoş geldiniz, <span className="text-neon-cyan">{profile?.full_name || user.email}</span>
              </span>
              <Button
                onClick={handleDashboard}
                variant="outline"
                size="sm"
                className="hologram-card hover:bg-secondary/30 transition-all duration-300 bg-transparent"
              >
                <Bot className="h-4 w-4 mr-2" />
                Botlarım
              </Button>
              <Button
                onClick={handleProfile}
                variant="outline"
                size="sm"
                className="hologram-card hover:bg-secondary/30 transition-all duration-300 bg-transparent"
              >
                <User className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="hologram-card hover:bg-secondary/30 transition-all duration-300 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)] relative">
        <div className="w-[400px] border-r border-border bg-card/30 backdrop-blur-sm flex flex-col relative">
          {/* Search and filters */}
          <div className="p-3 space-y-2 border-b border-border flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Ara veya yeni sohbet başlat"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50 border-border text-sm h-9">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="closed">Kapalı</SelectItem>
                  <SelectItem value="waiting">Bekliyor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={instanceFilter} onValueChange={setInstanceFilter}>
                <SelectTrigger className="bg-background/50 border-border text-sm h-9">
                  <SelectValue placeholder="Instance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {instances.map((instance) => (
                    <SelectItem key={instance.id} value={instance.instance_name}>
                      {instance.instance_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={fetchChatsFromEvolution} size="sm" variant="ghost" className="px-2 hover:bg-secondary">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground px-4">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Konuşma bulunamadı</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full text-left p-3 border-b border-border/50 transition-colors hover:bg-secondary/50 ${
                    selectedConversation?.id === conversation.id ? "bg-secondary" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
                      {conversation.customer_name?.[0]?.toUpperCase() || conversation.customer_phone[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-sm truncate">
                          {conversation.customer_name || conversation.customer_phone}
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(conversation.last_message_at), {
                            addSuffix: false,
                            locale: tr,
                          })}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1 truncate">
                        {conversation.last_message || "Henüz mesaj yok"}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-neon-cyan text-background text-xs px-1.5 py-0">
                            {conversation.unread_count}
                          </Badge>
                        )}
                        {conversation.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-border/50 px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-background/50 relative">
          {selectedConversation ? (
            <MessageList conversation={selectedConversation} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-neon-blue/30">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <p className="text-lg font-semibold mb-2">WhatsApp AI Otomasyonu</p>
                <p className="text-sm text-muted-foreground">Mesajları görüntülemek için bir konuşma seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
