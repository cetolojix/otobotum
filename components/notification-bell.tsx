"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, MessageSquare, UserCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  conversation_id: string
  customer_name: string | null
  customer_phone: string
  message_preview: string
  created_at: string
  is_read: boolean
  notification_type: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      // Evolution API doesn't have operator assignment or unread tracking
      // To enable notifications, you'll need to implement a hybrid approach:
      // 1. Store operator assignments in database
      // 2. Track unread counts in database
      // 3. Sync with Evolution API data

      setNotifications([])
      setUnreadCount(0)

      /* Original database query - requires assigned_operator column
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: conversations } = await supabase
        .from("conversations")
        .select(`
          *,
          contacts (
            name,
            phone_number
          )
        `)
        .eq("assigned_operator", user.id)
        .gt("unread_count", 0)
        .order("last_message_at", { ascending: false })
        .limit(10)

      if (conversations) {
        const notifs: Notification[] = conversations.map((conv: any) => ({
          id: conv.id,
          conversation_id: conv.id,
          customer_name: conv.contacts?.name || null,
          customer_phone: conv.contacts?.phone_number || "Unknown",
          message_preview: "Yeni mesaj",
          created_at: conv.last_message_at,
          is_read: false,
          notification_type: "new_message",
        }))

        setNotifications(notifs)
        setUnreadCount(notifs.length)
      }
      */
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleNotificationClick = (conversationId: string) => {
    router.push(`/conversations?selected=${conversationId}`)
    setOpen(false)
  }

  const handleMarkAllRead = async () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-gray-900 border-gray-800" align="end">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-semibold text-white">Bildirimler</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Yeni bildirim yok</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.conversation_id)}
                  className="w-full text-left p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {notification.customer_name?.[0]?.toUpperCase() || notification.customer_phone[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-sm">
                          {notification.customer_name || notification.customer_phone}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{notification.message_preview}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {notification.notification_type === "new_message" && (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Yeni Mesaj
                          </Badge>
                        )}
                        {notification.notification_type === "intervention_needed" && (
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                            <UserCircle className="h-3 w-3 mr-1" />
                            Müdahale Gerekli
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
