/**
 * Ödeme yöntemi bayrakları — TEK KAYNAK.
 *
 * Hem checkout arayüzü (OdemeClient) hem de sipariş API route'ları buradan
 * okur; biri açık diğeri kapalı kalmasın diye ayrı ayrı tanımlanmaz.
 * Bir yöntem kapatıldığında ilgili route da isteği reddeder — arayüzde
 * seçenek görünmese bile endpoint'e doğrudan POST atılabileceği için.
 */

/** Online kart ödemesi (PayTR hesabı kapandı; yeni sağlayıcıda true yapılacak) */
export const ONLINE_PAYMENT_ENABLED = false

/** Kapıda ödeme (kargo tahsilat maliyeti nedeniyle kapatıldı) */
export const CASH_ON_DELIVERY_ENABLED = false

/** Hiçbir ödeme yöntemi açık değilse checkout bakım ekranına düşer */
export const ANY_PAYMENT_ENABLED = ONLINE_PAYMENT_ENABLED || CASH_ON_DELIVERY_ENABLED

/** Bakım ekranındaki sipariş hattı */
export const SUPPORT_PHONE = '+905321773721'
export const SUPPORT_PHONE_DISPLAY = '0532 177 3721'
export const SUPPORT_WHATSAPP = 'https://wa.me/905321773721'
