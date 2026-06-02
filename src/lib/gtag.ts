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

/**
 * gtag.js Script `afterInteractive` ile yükleniyor — React useEffect ile
 * yarış halinde. Eğer useEffect önce çalışırsa window.gtag henüz tanımlı
 * olmuyor ve event sessizce kayboluyor (özellikle Tag Assistant debug
 * session'larında daha sık görülüyor).
 *
 * Bu fonksiyon Google'ın resmi stub pattern'ini uygular: dataLayer ve
 * gtag fonksiyonu hep tanımlı olsun. Real gtag.js sonra yüklenince
 * queue'daki event'leri otomatik işler.
 */
function ensureGtagStub() {
  if (typeof window === 'undefined') return false
  window.dataLayer = window.dataLayer || []
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments as unknown as unknown[])
    }
  }
  return true
}

export function trackPurchase(params: {
  orderId: string
  value: number
  items: PurchaseItem[]
}) {
  if (!ensureGtagStub()) return

  window.gtag!('event', 'purchase', {
    transaction_id: params.orderId,
    value: params.value,
    currency: 'TRY',
    items: params.items,
  })

  if (ADS_PURCHASE_LABEL) {
    window.gtag!('event', 'conversion', {
      send_to: ADS_PURCHASE_LABEL,
      value: params.value,
      currency: 'TRY',
      transaction_id: params.orderId,
    })
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!ensureGtagStub()) return
  window.gtag!('event', name, params)
}

export {}
