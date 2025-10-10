import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const body = await request.json()
    const { instanceName, productQuery } = body

    console.log("[v0] Product search request:", { instanceName, productQuery })

    if (!instanceName || !productQuery) {
      return NextResponse.json({ error: "Instance name and product query are required" }, { status: 400 })
    }

    // Search for product by name (case-insensitive partial match)
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("instance_name", instanceName)
      .eq("is_active", true)
      .ilike("product_name", `%${productQuery}%`)

    if (productsError) {
      console.error("[v0] Error searching products:", productsError)
      return NextResponse.json({ error: productsError.message }, { status: 500 })
    }

    if (!products || products.length === 0) {
      console.log("[v0] No products found for query:", productQuery)
      return NextResponse.json({
        content: `Üzgünüm, "${productQuery}" için ürün bulunamadı. Lütfen ürün adını kontrol edin veya başka bir ürün sorun.`,
        productsFound: 0,
      })
    }

    // If multiple products found, return list
    if (products.length > 1) {
      const productList = products.map((p) => `- ${p.product_name}`).join("\n")
      return NextResponse.json({
        content: `"${productQuery}" için ${products.length} ürün bulundu:\n\n${productList}\n\nLütfen tam ürün adını belirtin.`,
        productsFound: products.length,
        products: products.map((p) => ({
          name: p.product_name,
          url: p.product_url,
        })),
      })
    }

    // Fetch product page content
    const product = products[0]
    console.log("[v0] Fetching product page:", product.product_url)

    const response = await fetch(product.product_url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch product page:", response.status)
      return NextResponse.json({
        content: `${product.product_name} bilgisi şu anda alınamıyor. Lütfen daha sonra tekrar deneyin.`,
        productsFound: 1,
      })
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove script and style tags
    $("script, style, nav, footer, header").remove()

    // Extract text content
    let content = $("body").text()
    content = content.replace(/\s+/g, " ").replace(/\n+/g, "\n").trim().substring(0, 5000)

    console.log("[v0] Product page content extracted:", content.substring(0, 200))

    return NextResponse.json({
      content: `${product.product_name} hakkında bilgiler:\n\n${content}`,
      productsFound: 1,
      product: {
        name: product.product_name,
        url: product.product_url,
        description: product.description,
      },
    })
  } catch (error) {
    console.error("[v0] Error in product search:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
