declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const ADS_PURCHASE_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL

export interface PurchaseItem {
  item_id: string
  item_name: string
  price: number
  quantity: number
}

export function trackPurchase(params: {
  orderId: string
  value: number
  items: PurchaseItem[]
}) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'purchase', {
    transaction_id: params.orderId,
    value: params.value,
    currency: 'TRY',
    items: params.items,
  })

  if (ADS_PURCHASE_LABEL) {
    window.gtag('event', 'conversion', {
      send_to: ADS_PURCHASE_LABEL,
      value: params.value,
      currency: 'TRY',
      transaction_id: params.orderId,
    })
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, params)
}

export {}
