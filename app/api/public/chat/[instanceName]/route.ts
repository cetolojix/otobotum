import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { instanceName: string } }) {
  try {
    const { instanceName } = params
    const { message, conversationId } = await request.json()

    if (!message || !instanceName) {
      return NextResponse.json({ error: "Message and instance name are required" }, { status: 400 })
    }

    // Get AI prompt for this instance
    const supabase = await createClient()
    const { data: promptData, error: promptError } = await supabase
      .from("ai_prompts")
      .select("prompt")
      .eq("instance_name", instanceName)
      .single()

    if (promptError || !promptData) {
      console.error("[v0] Failed to fetch prompt:", promptError)
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    }

    // Generate AI response using Groq
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 })
    }

    const systemPrompt = promptData.prompt || "Sen yardımsever bir müşteri hizmetleri asistanısın."

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!groqResponse.ok) {
      console.error("[v0] Groq API error:", await groqResponse.text())
      return NextResponse.json({ error: "AI service error" }, { status: 500 })
    }

    const groqData = await groqResponse.json()
    const aiResponse = groqData.choices[0]?.message?.content || "Üzgünüm, şu anda yanıt veremiyorum."

    // Return response with CORS headers
    return NextResponse.json(
      {
        success: true,
        response: aiResponse,
        conversationId: conversationId || `web-${Date.now()}`,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Public chat error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
