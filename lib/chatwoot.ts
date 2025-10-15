// Chatwoot API Client

interface ChatwootConfig {
  apiUrl: string
  apiKey: string
  accountId: number
}

interface CreateInboxParams {
  name: string
  channel: {
    type: "api"
    webhook_url?: string
  }
}

interface CreateContactParams {
  inbox_id: number
  name?: string
  phone_number?: string
  email?: string
}

interface CreateConversationParams {
  contact_id: number
  inbox_id: number
  status?: "open" | "resolved" | "pending"
}

interface SendMessageParams {
  conversation_id: number
  content: string
  message_type?: "outgoing" | "incoming"
  private?: boolean
}

export class ChatwootClient {
  private config: ChatwootConfig

  constructor(config: ChatwootConfig) {
    this.config = config
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.apiUrl}/api/v1/accounts/${this.config.accountId}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        api_access_token: this.config.apiKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Chatwoot API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // Create inbox
  async createInbox(params: CreateInboxParams) {
    return this.request("/inboxes", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  // Get inbox
  async getInbox(inboxId: number) {
    return this.request(`/inboxes/${inboxId}`)
  }

  // Create contact
  async createContact(params: CreateContactParams) {
    return this.request("/contacts", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  // Search contact by phone
  async searchContact(phoneNumber: string) {
    return this.request(`/contacts/search?q=${encodeURIComponent(phoneNumber)}`)
  }

  // Create conversation
  async createConversation(params: CreateConversationParams) {
    return this.request("/conversations", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  // Send message
  async sendMessage(params: SendMessageParams) {
    return this.request(`/conversations/${params.conversation_id}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content: params.content,
        message_type: params.message_type || "outgoing",
        private: params.private || false,
      }),
    })
  }

  // Create webhook
  async createWebhook(url: string, subscriptions: string[]) {
    return this.request("/webhooks", {
      method: "POST",
      body: JSON.stringify({
        url,
        subscriptions,
      }),
    })
  }
}

// Helper function to create Chatwoot client from environment variables
export function createChatwootClient(): ChatwootClient | null {
  const apiUrl = process.env.CHATWOOT_API_URL || "https://chatwoot.cetoloji.com"
  const apiKey = process.env.CHATWOOT_API_KEY || "fDh4cdhs15tDosqP27hdNzge"
  const accountId = process.env.CHATWOOT_ACCOUNT_ID || "1"

  if (!apiUrl || !apiKey || !accountId) {
    console.warn("[Chatwoot] Missing environment variables")
    return null
  }

  return new ChatwootClient({
    apiUrl,
    apiKey,
    accountId: Number.parseInt(accountId),
  })
}
