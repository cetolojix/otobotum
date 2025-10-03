import { SubscriptionDashboard } from "@/components/subscription-dashboard"

export default function AccountSubscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Abonelik Yönetimi</h1>
        <p className="text-muted-foreground">Aboneliğinizi ve ödeme geçmişinizi yönetin</p>
      </div>

      <SubscriptionDashboard language="tr" />
    </div>
  )
}
