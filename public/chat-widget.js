;(() => {
  // Get configuration
  const config = window.whatsappAIConfig || {}
  const instanceName = config.instanceName || "default"

  let apiUrl = config.apiUrl
  if (!apiUrl) {
    const hostname = window.location.hostname
    // v0 preview veya localhost ise, relative URL kullan
    if (hostname.includes("v0.app") || hostname === "localhost" || hostname === "127.0.0.1") {
      apiUrl = `/api/public/chat/${instanceName}`
    } else {
      // Production'da cetobot.com kullan
      apiUrl = `https://cetobot.com/api/public/chat/${instanceName}`
    }
  }

  const primaryColor = config.primaryColor || "#3b82f6"
  const position = config.position || "right"
  const welcomeMessage = config.welcomeMessage || "Merhaba! Size nasıl yardımcı olabilirim?"

  console.log("[v0] Chat widget initialized with API URL:", apiUrl)

  // Create styles
  const styles = `
    .wa-chat-widget-container {
      position: fixed;
      bottom: 20px;
      ${position}: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    
    .wa-chat-bubble {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${primaryColor};
      display: flex;
      align-items: center;
      justify-center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .wa-chat-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    
    .wa-chat-bubble svg {
      width: 32px;
      height: 32px;
      fill: white;
    }
    
    .wa-chat-window {
      position: fixed;
      bottom: 100px;
      ${position}: 20px;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 600px;
      max-height: calc(100vh - 140px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9998;
    }
    
    .wa-chat-window.open {
      display: flex;
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .wa-chat-header {
      background-color: ${primaryColor};
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .wa-chat-header-title {
      font-size: 18px;
      font-weight: 600;
    }
    
    .wa-chat-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    
    .wa-chat-close:hover {
      background-color: rgba(255,255,255,0.1);
    }
    
    .wa-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background-color: #f5f5f5;
    }
    
    .wa-chat-message {
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
    }
    
    .wa-chat-message.user {
      align-items: flex-end;
    }
    
    .wa-chat-message.bot {
      align-items: flex-start;
    }
    
    .wa-chat-message-bubble {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      word-wrap: break-word;
    }
    
    .wa-chat-message.user .wa-chat-message-bubble {
      background-color: ${primaryColor};
      color: white;
    }
    
    .wa-chat-message.bot .wa-chat-message-bubble {
      background-color: white;
      color: #333;
    }
    
    .wa-chat-input-container {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e5e5;
      display: flex;
      gap: 8px;
    }
    
    .wa-chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e5e5e5;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
    }
    
    .wa-chat-input:focus {
      border-color: ${primaryColor};
    }
    
    .wa-chat-send {
      background-color: ${primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-center;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    
    .wa-chat-send:hover {
      opacity: 0.9;
    }
    
    .wa-chat-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .wa-chat-typing {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: white;
      border-radius: 12px;
      width: fit-content;
    }
    
    .wa-chat-typing span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #999;
      animation: typing 1.4s infinite;
    }
    
    .wa-chat-typing span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .wa-chat-typing span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-10px);
      }
    }
  `

  // Inject styles
  const styleSheet = document.createElement("style")
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)

  // Create widget HTML
  const widgetHTML = `
    <div class="wa-chat-widget-container">
      <div class="wa-chat-bubble" id="wa-chat-bubble">
        <svg viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </div>
      
      <div class="wa-chat-window" id="wa-chat-window">
        <div class="wa-chat-header">
          <div class="wa-chat-header-title">Canlı Destek</div>
          <button class="wa-chat-close" id="wa-chat-close">&times;</button>
        </div>
        <div class="wa-chat-messages" id="wa-chat-messages"></div>
        <div class="wa-chat-input-container">
          <input type="text" class="wa-chat-input" id="wa-chat-input" placeholder="Mesajınızı yazın..." />
          <button class="wa-chat-send" id="wa-chat-send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `

  // Inject widget
  document.body.insertAdjacentHTML("beforeend", widgetHTML)

  // Get elements
  const bubble = document.getElementById("wa-chat-bubble")
  const chatWindow = document.getElementById("wa-chat-window")
  const closeBtn = document.getElementById("wa-chat-close")
  const messagesContainer = document.getElementById("wa-chat-messages")
  const input = document.getElementById("wa-chat-input")
  const sendBtn = document.getElementById("wa-chat-send")

  let conversationId = null
  let isOpen = false

  // Add welcome message
  function addWelcomeMessage() {
    addMessage(welcomeMessage, "bot")
  }

  // Add message to chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `wa-chat-message ${sender}`

    const bubbleDiv = document.createElement("div")
    bubbleDiv.className = "wa-chat-message-bubble"
    bubbleDiv.textContent = text

    messageDiv.appendChild(bubbleDiv)
    messagesContainer.appendChild(messageDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  // Show typing indicator
  function showTyping() {
    const typingDiv = document.createElement("div")
    typingDiv.className = "wa-chat-message bot"
    typingDiv.id = "wa-typing-indicator"

    const typingBubble = document.createElement("div")
    typingBubble.className = "wa-chat-typing"
    typingBubble.innerHTML = "<span></span><span></span><span></span>"

    typingDiv.appendChild(typingBubble)
    messagesContainer.appendChild(typingDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  // Hide typing indicator
  function hideTyping() {
    const typingIndicator = document.getElementById("wa-typing-indicator")
    if (typingIndicator) {
      typingIndicator.remove()
    }
  }

  // Send message
  async function sendMessage() {
    const message = input.value.trim()
    if (!message) return

    // Add user message
    addMessage(message, "user")
    input.value = ""
    sendBtn.disabled = true

    // Show typing
    showTyping()

    console.log("[v0] Sending message to API:", apiUrl)

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversationId,
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText)
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] API response data:", data)

      hideTyping()

      if (data.success) {
        addMessage(data.response, "bot")
        conversationId = data.conversationId
      } else {
        addMessage("Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.", "bot")
      }
    } catch (error) {
      console.error("[v0] Chat widget error:", error)
      hideTyping()
      addMessage("Bağlantı hatası. Lütfen daha sonra tekrar deneyin.", "bot")
    } finally {
      sendBtn.disabled = false
      input.focus()
    }
  }

  // Event listeners
  bubble.addEventListener("click", () => {
    isOpen = !isOpen
    chatWindow.classList.toggle("open")
    if (isOpen && messagesContainer.children.length === 0) {
      addWelcomeMessage()
    }
    if (isOpen) {
      input.focus()
    }
  })

  closeBtn.addEventListener("click", () => {
    isOpen = false
    chatWindow.classList.remove("open")
  })

  sendBtn.addEventListener("click", sendMessage)

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  })
})()
