// iyzico Subscription API Client
// Implements iyzico's native subscription system
import crypto from "crypto"

interface IyzicoConfig {
  apiKey: string
  secretKey: string
  baseUrl: string
}

// Product Management
interface CreateProductRequest {
  locale?: string
  conversationId?: string
  name: string
  description?: string
}

interface ProductResponse {
  status: string
  locale: string
  systemTime: number
  conversationId?: string
  productReferenceCode?: string
  errorCode?: string
  errorMessage?: string
}

// Pricing Plan Management
interface CreatePricingPlanRequest {
  locale?: string
  conversationId?: string
  productReferenceCode: string
  name: string
  price: string
  currencyCode: string
  paymentInterval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  paymentIntervalCount: number
  trialPeriodDays?: number
  planPaymentType: "RECURRING"
}

interface PricingPlanResponse {
  status: string
  locale: string
  systemTime: number
  conversationId?: string
  pricingPlanReferenceCode?: string
  errorCode?: string
  errorMessage?: string
}

// Subscription Management
interface InitializeSubscriptionRequest {
  locale?: string
  conversationId?: string
  pricingPlanReferenceCode: string
  subscriptionInitialStatus?: "ACTIVE" | "PENDING"
  customer: {
    name: string
    surname: string
    identityNumber: string
    email: string
    gsmNumber: string
    billingAddress: {
      contactName: string
      city: string
      district: string
      country: string
      address: string
      zipCode?: string
    }
    shippingAddress: {
      contactName: string
      city: string
      district: string
      country: string
      address: string
      zipCode?: string
    }
  }
}

interface SubscriptionResponse {
  status: string
  locale: string
  systemTime: number
  conversationId?: string
  subscriptionReferenceCode?: string
  parentReferenceCode?: string
  customerReferenceCode?: string
  pricingPlanReferenceCode?: string
  subscriptionStatus?: string
  trialDays?: number
  trialStartDate?: number
  trialEndDate?: number
  startDate?: number
  checkoutFormContent?: string
  errorCode?: string
  errorMessage?: string
}

class IyzicoSubscriptionClient {
  private config: IyzicoConfig

  constructor() {
    this.config = {
      apiKey: process.env.IYZICO_API_KEY || "",
      secretKey: process.env.IYZICO_SECRET_KEY || "",
      baseUrl: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
    }

    if (!this.config.apiKey || !this.config.secretKey) {
      console.warn("[iyzico-subscription] API credentials not configured")
    }
  }

  private generateAuthString(url: string, body: string): string {
    const randomString = this.generateRandomString()
    const dataToEncrypt = [randomString, this.config.apiKey, this.config.secretKey, url, body].join("")
    const hash = crypto.createHmac("sha256", this.config.secretKey).update(dataToEncrypt).digest("base64")
    return `IYZWS ${this.config.apiKey}:${hash}`
  }

  private generateRandomString(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private async makeRequest<T>(url: string, body: any): Promise<T> {
    const bodyString = JSON.stringify(body)

    try {
      const response = await fetch(`${this.config.baseUrl}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.generateAuthString(url, bodyString),
          "x-iyzi-rnd": this.generateRandomString(),
        },
        body: bodyString,
      })

      const data = await response.json()
      return data as T
    } catch (error) {
      console.error("[iyzico-subscription] Request error:", error)
      throw error
    }
  }

  // Create a product (Step 1)
  async createProduct(request: CreateProductRequest): Promise<ProductResponse> {
    const url = "/v2/subscription/products"
    return this.makeRequest<ProductResponse>(url, {
      locale: request.locale || "tr",
      conversationId: request.conversationId || this.generateRandomString(),
      ...request,
    })
  }

  // Create a pricing plan (Step 2)
  async createPricingPlan(request: CreatePricingPlanRequest): Promise<PricingPlanResponse> {
    const url = "/v2/subscription/pricing-plans"
    return this.makeRequest<PricingPlanResponse>(url, {
      locale: request.locale || "tr",
      conversationId: request.conversationId || this.generateRandomString(),
      ...request,
    })
  }

  // Initialize subscription with checkout form (Step 3)
  async initializeSubscription(request: InitializeSubscriptionRequest): Promise<SubscriptionResponse> {
    const url = "/v2/subscription/subscriptions/initialize"
    return this.makeRequest<SubscriptionResponse>(url, {
      locale: request.locale || "tr",
      conversationId: request.conversationId || this.generateRandomString(),
      subscriptionInitialStatus: request.subscriptionInitialStatus || "PENDING",
      ...request,
    })
  }

  // Cancel subscription
  async cancelSubscription(subscriptionReferenceCode: string): Promise<SubscriptionResponse> {
    const url = "/v2/subscription/subscriptions/cancel"
    return this.makeRequest<SubscriptionResponse>(url, {
      locale: "tr",
      conversationId: this.generateRandomString(),
      subscriptionReferenceCode,
    })
  }

  // Retrieve subscription details
  async retrieveSubscription(subscriptionReferenceCode: string): Promise<SubscriptionResponse> {
    const url = "/v2/subscription/subscriptions/retrieve"
    return this.makeRequest<SubscriptionResponse>(url, {
      locale: "tr",
      conversationId: this.generateRandomString(),
      subscriptionReferenceCode,
    })
  }
}

export const iyzicoSubscriptionClient = new IyzicoSubscriptionClient()
export type {
  CreateProductRequest,
  ProductResponse,
  CreatePricingPlanRequest,
  PricingPlanResponse,
  InitializeSubscriptionRequest,
  SubscriptionResponse,
}
