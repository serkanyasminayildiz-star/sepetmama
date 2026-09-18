/**
 * iyzico Checkout Form istemcisi — SDK'sız, doğrudan REST.
 *
 * Neden SDK yok: `iyzipay` paketi kaynaklarını fs.readdirSync + dinamik
 * require ile yüklüyor ve eski `postman-request` HTTP kütüphanesine bağımlı.
 * Vercel'in dosya izleyicisi bu zinciri göremiyor → canlıda ENOENT /
 * "Cannot find module" (2026-09-18). İmza algoritması SDK kaynağından
 * (lib/utils.js generateHashV2) birebir alındı; aynı yaklaşım evemama.net'te
 * canlıda çalışıyor.
 *
 * Checkout Form (hosted): kart bilgisi hiçbir zaman bizim sunucumuza girmez.
 */
import crypto from 'crypto'

const API_KEY = process.env.IYZICO_API_KEY || ''
const SECRET_KEY = process.env.IYZICO_SECRET_KEY || ''

// Vercel'de IYZICO_BASE_URL; IYZICO_URI geriye dönük. Protokolsüz / sonu "/"
// girilirse normalize edilir. Env yoksa sandbox (yanlışlıkla canlıya gitmesin).
function normalizeUri(raw: string | undefined): string {
  let u = (raw || '').trim()
  if (!u) return 'https://sandbox-api.iyzipay.com'
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u
  return u.replace(/\/+$/, '')
}
const BASE_URL = normalizeUri(process.env.IYZICO_BASE_URL || process.env.IYZICO_URI)

export const IYZICO_CONFIGURED = Boolean(API_KEY && SECRET_KEY)
export const IYZICO_IS_LIVE = BASE_URL.includes('//api.iyzipay.com')

const INIT_PATH = '/payment/iyzipos/checkoutform/initialize/ecom'
const RETRIEVE_PATH = '/payment/iyzipos/checkoutform/auth/ecom/detail'

export interface IyzicoBasketItem {
  id: string
  name: string
  category1: string
  itemType: string
  price: string
}

export interface CheckoutFormInitRequest {
  locale: string
  conversationId: string
  price: string
  paidPrice: string
  currency: string
  basketId: string
  paymentGroup: string
  callbackUrl: string
  enabledInstallments: number[]
  buyer: {
    id: string
    name: string
    surname: string
    gsmNumber: string
    email: string
    identityNumber: string
    registrationAddress: string
    ip: string
    city: string
    country: string
  }
  shippingAddress: { contactName: string; city: string; country: string; address: string }
  billingAddress: { contactName: string; city: string; country: string; address: string }
  basketItems: IyzicoBasketItem[]
}

export interface CheckoutFormInitResult {
  status: 'success' | 'failure'
  errorMessage?: string
  errorCode?: string
  token?: string
  checkoutFormContent?: string
  paymentPageUrl?: string
  conversationId?: string
}

export interface CheckoutFormRetrieveResult {
  status: 'success' | 'failure'
  errorMessage?: string
  errorCode?: string
  /** Ödeme sonucu: SUCCESS / FAILURE */
  paymentStatus?: string
  paymentId?: string
  /** Bizim gönderdiğimiz sipariş id'si */
  basketId?: string
  conversationId?: string
  paidPrice?: string
  currency?: string
  fraudStatus?: number
}

function randomString(): string {
  return process.hrtime()[0] + Math.random().toString(8).slice(2)
}

/** IYZWSv2 yetkilendirme başlığı — SDK utils.generateHashV2 ile birebir */
function authHeader(rnd: string, path: string, bodyJson: string): string {
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rnd + path + bodyJson)
    .digest('hex')
  const params = [`apiKey:${API_KEY}`, `randomKey:${rnd}`, `signature:${signature}`].join('&')
  return 'IYZWSv2 ' + Buffer.from(params).toString('base64')
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  if (!IYZICO_CONFIGURED) {
    // Sessizce başarısız olmak yerine net hata: env eksikse hemen görülsün
    throw new Error('IYZICO_API_KEY / IYZICO_SECRET_KEY tanımlı değil')
  }
  const rnd = randomString()
  // İmzalanan ve gönderilen gövde AYNI string olmalı
  const bodyJson = JSON.stringify(body)
  const res = await fetch(BASE_URL + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(rnd, path, bodyJson),
      'x-iyzi-rnd': rnd,
      'x-iyzi-client-version': 'iyzipay-node-2.0.69',
    },
    body: bodyJson,
  })
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`iyzico beklenmeyen yanıt (HTTP ${res.status}): ${text.slice(0, 200)}`)
  }
}

/** iyzico ödeme sayfasını başlatır; token + yönlendirilecek URL döner. */
export function initCheckoutForm(request: CheckoutFormInitRequest): Promise<CheckoutFormInitResult> {
  return post<CheckoutFormInitResult>(INIT_PATH, request as unknown as Record<string, unknown>)
}

/**
 * Ödeme sonucunu iyzico'dan DOĞRULAR.
 * Callback'te gelen veriye asla güvenilmez; tutar/durum buradan okunur.
 */
export function retrieveCheckoutForm(token: string): Promise<CheckoutFormRetrieveResult> {
  return post<CheckoutFormRetrieveResult>(RETRIEVE_PATH, { locale: 'tr', token })
}

export const IYZICO_CONSTANTS = {
  LOCALE_TR: 'tr',
  CURRENCY_TRY: 'TRY',
  PAYMENT_GROUP_PRODUCT: 'PRODUCT',
  BASKET_ITEM_PHYSICAL: 'PHYSICAL',
}
