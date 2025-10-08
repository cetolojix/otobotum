// iyzico API client for payment processing
import crypto from "crypto"

interface IyzicoConfig {
  apiKey: string
  secretKey: string
  baseUrl: string
}

interface PaymentRequest {
  locale?: string
  conversationId: string
  price: string
  paidPrice: string
  currency: string
  basketId: string
  paymentGroup: string
  callbackUrl: string
  buyer: {
    id: string
    name: string
    surname: string
    email: string
    identityNumber: string
    registrationAddress: string
    city: string
    country: string
    ip: string
  }
  shippingAddress: {
    contactName: string
    city: string
    country: string
    address: string
  }
  billingAddress: {
    contactName: string
    city: string
    country: string
    address: string
  }
  basketItems: Array<{
    id: string
    name: string
    category1: string
    itemType: string
    price: string
  }>
}

interface PaymentResponse {
  status: string
  locale: string
  systemTime: number
  conversationId: string
  paymentId?: string
  paymentStatus?: string
  fraudStatus?: number
  price?: number
  paidPrice?: number
  currency?: string
  basketId?: string
  paymentPageUrl?: string
  errorCode?: string
  errorMessage?: string
  errorGroup?: string
}

class IyzicoClient {
  private config: IyzicoConfig

  constructor() {
    this.config = {
      apiKey: process.env.IYZICO_API_KEY || "",
      secretKey: process.env.IYZICO_SECRET_KEY || "",
      baseUrl: process.env.IYZICO_BASE_URL || "https://api.iyzipay.com",
    }

    if (!this.config.apiKey || !this.config.secretKey) {
      console.warn("[iyzico] API credentials not configured")
    }
  }

  private generateAuthString(url: string, body: string): string {
    const randomString = this.generateRandomString()

    const dataToEncrypt = [randomString, this.config.apiKey, this.config.secretKey, url, body].join("")

    const hash = crypto.createHmac("sha256", this.config.secretKey).update(dataToEncrypt).digest("base64")

    return `IYZWS ${this.config.apiKey}:${hash}`
  }

  private generateRandomString(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  async createCheckoutForm(request: PaymentRequest): Promise<PaymentResponse> {
    const url = "/payment/iyzipos/checkoutform/initialize/auth/ecom"
    const body = JSON.stringify(request)

    try {
      const response = await fetch(`${this.config.baseUrl}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.generateAuthString(url, body),
          "x-iyzi-rnd": this.generateRandomString(),
        },
        body,
      })

      const data = await response.json()
      return data as PaymentResponse
    } catch (error) {
      console.error("[iyzico] Error creating checkout form:", error)
      throw error
    }
  }

  async retrieveCheckoutForm(token: string): Promise<PaymentResponse> {
    const url = "/payment/iyzipos/checkoutform/auth/ecom/detail"
    const body = JSON.stringify({
      locale: "tr",
      token,
    })

    try {
      const response = await fetch(`${this.config.baseUrl}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.generateAuthString(url, body),
          "x-iyzi-rnd": this.generateRandomString(),
        },
        body,
      })

      const data = await response.json()
      return data as PaymentResponse
    } catch (error) {
      console.error("[iyzico] Error retrieving checkout form:", error)
      throw error
    }
  }
}

export const iyzicoClient = new IyzicoClient()
export type { PaymentRequest, PaymentResponse }
