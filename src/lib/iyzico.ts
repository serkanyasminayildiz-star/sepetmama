/**
 * iyzico Checkout Form istemcisi.
 *
 * Checkout Form (hosted) seçildi: kart bilgisi hiçbir zaman bizim sunucumuza
 * girmez, iyzico'nun kendi ödeme sayfasında toplanır → PCI yükü bizde olmaz.
 *
 * SDK callback tabanlı ve tip tanımı yok; burada promise'e sarıp ihtiyacımız
 * olan alanları tiplendiriyoruz.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Iyzipay = require('iyzipay')

const API_KEY = process.env.IYZICO_API_KEY
const SECRET_KEY = process.env.IYZICO_SECRET_KEY
// Varsayılan sandbox: env eksikse yanlışlıkla canlı ortama istek gitmesin
const URI = process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'

export const IYZICO_CONFIGURED = Boolean(API_KEY && SECRET_KEY)
export const IYZICO_IS_LIVE = URI.includes('//api.iyzipay.com')

function getClient() {
  if (!IYZICO_CONFIGURED) {
    // Sessizce başarısız olmak yerine net hata: env eksikse deploy'da hemen görülsün
    throw new Error('IYZICO_API_KEY / IYZICO_SECRET_KEY tanımlı değil')
  }
  return new Iyzipay({ apiKey: API_KEY, secretKey: SECRET_KEY, uri: URI })
}

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

/** iyzico ödeme sayfasını başlatır; token + yönlendirilecek URL döner. */
export function initCheckoutForm(
  request: CheckoutFormInitRequest
): Promise<CheckoutFormInitResult> {
  const client = getClient()
  return new Promise((resolve, reject) => {
    client.checkoutFormInitialize.create(
      request,
      (err: unknown, result: CheckoutFormInitResult) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

/**
 * Ödeme sonucunu iyzico'dan DOĞRULAR.
 * Callback'te gelen veriye asla güvenilmez; tutar/durum buradan okunur.
 */
export function retrieveCheckoutForm(token: string): Promise<CheckoutFormRetrieveResult> {
  const client = getClient()
  return new Promise((resolve, reject) => {
    client.checkoutForm.retrieve(
      { locale: Iyzipay.LOCALE.TR, token },
      (err: unknown, result: CheckoutFormRetrieveResult) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

export const IYZICO_CONSTANTS = {
  LOCALE_TR: Iyzipay.LOCALE.TR as string,
  CURRENCY_TRY: Iyzipay.CURRENCY.TRY as string,
  PAYMENT_GROUP_PRODUCT: Iyzipay.PAYMENT_GROUP.PRODUCT as string,
  BASKET_ITEM_PHYSICAL: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL as string,
}
