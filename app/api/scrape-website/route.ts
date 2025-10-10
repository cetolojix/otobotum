import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, query, instanceName, productQuery } = body

    let finalUrl = url

    // Eğer instanceName ve productQuery verilmişse, database'den web sitesi URL'ini al
    if (instanceName && productQuery) {
      const supabase = await createClient()

      const { data: instance, error } = await supabase
        .from("whatsapp_instances")
        .select("website_url")
        .eq("name", instanceName)
        .maybeSingle()

      if (error) {
        console.error("[v0] Error fetching instance website URL:", error)
        return NextResponse.json({ error: "Failed to fetch instance website URL" }, { status: 500 })
      }

      if (!instance || !instance.website_url) {
        return NextResponse.json(
          {
            error: "Web sitesi URL'i ayarlanmamış. Lütfen yapay zeka ayarlarından web sitesi URL'ini ekleyin.",
          },
          { status: 400 },
        )
      }

      // Web sitesi URL'ine ürün adını ekle
      // Eğer URL '/' ile bitiyorsa, ürün adını direkt ekle
      // Değilse, '/' ekleyip ürün adını ekle
      const baseUrl = instance.website_url.endsWith("/") ? instance.website_url : instance.website_url + "/"

      // Ürün adını URL-safe hale getir (boşlukları '-' ile değiştir, özel karakterleri temizle)
      const sanitizedQuery = productQuery
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")

      finalUrl = baseUrl + sanitizedQuery
      console.log("[v0] Constructed search URL:", finalUrl)
    }

    if (!finalUrl) {
      return NextResponse.json({ error: "URL or instanceName+productQuery is required" }, { status: 400 })
    }

    console.log("[v0] Scraping website:", finalUrl, "for query:", query || productQuery)

    // Fetch the website content
    const response = await fetch(finalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CetobotAI/1.0; +https://www.cetobot.com)",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`)
    }

    const html = await response.text()

    // Simple HTML parsing - extract text content
    // Remove script and style tags
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()

    // Limit text length to avoid token limits
    const maxLength = 5000
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + "..."
    }

    console.log("[v0] Scraped content length:", text.length)

    return NextResponse.json({
      success: true,
      content: text,
      url: finalUrl,
    })
  } catch (error) {
    console.error("[v0] Error scraping website:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to scrape website"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
