// İlk sipariş indirimi — kayıt/giriş teşviki.
// Giriş yapmış + daha önce ödenmiş siparişi olmayan müşteriye, bu siparişte
// otomatik uygulanır. Misafire "giriş yap → kazan" çağrısı gösterilir.
// (Pure modül — prisma import etmez, client'ta da kullanılabilir.)

export const FIRST_ORDER_RATE = 10 // %
export const FIRST_ORDER_MIN = 200 // ₺ minimum sepet

export type FirstOrderStatus = 'guest' | 'eligible' | 'used'

export function computeFirstOrderDiscount(cartTotal: number): number {
  if (cartTotal < FIRST_ORDER_MIN) return 0
  return Math.round(cartTotal * (FIRST_ORDER_RATE / 100) * 100) / 100
}
