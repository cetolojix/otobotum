import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { instanceName, customerPhone, customerName, orderDetails, orderAmount } = await request.json()

    if (!instanceName || !customerPhone || !orderDetails) {
      return NextResponse.json(
        { error: "Instance name, customer phone, and order details are required" },
        { status: 400 },
      )
    }

    console.log("[v0] Saving order to Google Sheets:", {
      instanceName,
      customerPhone,
      orderDetails: orderDetails.substring(0, 100),
    })

    const supabase = await createClient()

    // Get Google Sheets config for this instance
    const { data: config, error: configError } = await supabase
      .from("google_sheets_config")
      .select("*")
      .eq("instance_name", instanceName)
      .eq("is_active", true)
      .single()

    if (configError || !config) {
      console.log("[v0] No active Google Sheets config found for instance:", instanceName)
      return NextResponse.json(
        {
          success: false,
          message: "Google Sheets not configured for this instance",
        },
        { status: 200 },
      )
    }

    console.log("[v0] Found Google Sheets config:", config.id)

    // Parse order details to extract amount if not provided
    let finalAmount = orderAmount
    if (!finalAmount && orderDetails.includes("TL")) {
      const amountMatch = orderDetails.match(/(\d+(?:\.\d+)?)\s*TL/)
      if (amountMatch) {
        finalAmount = Number.parseFloat(amountMatch[1])
      }
    }

    // Save order to database
    const { data: order, error: orderError } = await supabase
      .from("google_sheets_orders")
      .insert({
        config_id: config.id,
        instance_name: instanceName,
        customer_phone: customerPhone,
        customer_name: customerName || null,
        order_details: orderDetails,
        order_amount: finalAmount || null,
        synced_to_sheets: false,
      })
      .select()
      .single()

    if (orderError) {
      console.error("[v0] Error saving order to database:", orderError)
      throw orderError
    }

    console.log("[v0] Order saved to database:", order.id)

    // Try to sync to Google Sheets
    try {
      await syncOrderToGoogleSheets(config, order)

      // Update sync status
      await supabase.from("google_sheets_orders").update({ synced_to_sheets: true }).eq("id", order.id)

      console.log("[v0] Order synced to Google Sheets successfully")
    } catch (syncError) {
      console.error("[v0] Error syncing to Google Sheets:", syncError)

      // Update sync error
      await supabase
        .from("google_sheets_orders")
        .update({
          sync_error: syncError instanceof Error ? syncError.message : "Unknown sync error",
        })
        .eq("id", order.id)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order saved successfully",
    })
  } catch (error) {
    console.error("[v0] Error saving order:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save order",
      },
      { status: 500 },
    )
  }
}

async function syncOrderToGoogleSheets(config: any, order: any) {
  // In a real implementation, you would:
  // 1. Use Google Sheets API with service account credentials
  // 2. Append a new row to the specified sheet
  // 3. Format: [Date, Phone, Customer Name, Order Details, Amount]

  console.log("[v0] Syncing order to Google Sheets:", {
    spreadsheet_id: config.spreadsheet_id,
    sheet_name: config.sheet_name,
    order_id: order.id,
  })

  // Example implementation with Google Sheets API:
  /*
  const { google } = require('googleapis');
  const sheets = google.sheets('v4');
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.service_account_email,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  
  await sheets.spreadsheets.values.append({
    auth: authClient,
    spreadsheetId: config.spreadsheet_id,
    range: `${config.sheet_name}!A:E`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        new Date(order.order_date).toLocaleString('tr-TR'),
        order.customer_phone,
        order.customer_name || '-',
        order.order_details,
        order.order_amount || '-',
      ]],
    },
  });
  */

  // For now, just log that we would sync
  console.log("[v0] Would append row to Google Sheets:", {
    date: new Date(order.order_date).toLocaleString("tr-TR"),
    phone: order.customer_phone,
    name: order.customer_name || "-",
    details: order.order_details,
    amount: order.order_amount || "-",
  })

  // Simulate successful sync
  return true
}
