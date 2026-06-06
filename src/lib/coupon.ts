import { prisma } from '@/lib/prisma'

export interface CouponResult {
  valid: boolean
  error?: string
  couponId?: string
  code?: string
  discount?: number // hesaplanmış indirim tutarı (TL)
}

/**
 * Kuponu doğrular ve indirim tutarını hesaplar.
 *
 * GÜVENLİK: cartTotal her zaman çağıran tarafın hesapladığı değerdir.
 * - /api/coupon/validate → sadece ÖNİZLEME için (client cartTotal'ı, manipüle
 *   edilebilir ama önemi yok; gerçek tahsilat sunucu hesabına göre yapılır)
 * - /api/paytr/token → SUNUCU tarafında DB fiyatlarından hesaplanan cartTotal
 *   ile çağrılır; gerçek indirim budur.
 */
export async function validateAndComputeCoupon(
  rawCode: string,
  cartTotal: number,
  userId?: string | null
): Promise<CouponResult> {
  const code = (rawCode || '').trim().toUpperCase()
  if (!code) return { valid: false, error: 'Kupon kodu girin.' }

  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon) return { valid: false, error: 'Kupon kodu geçersiz.' }
  if (!coupon.isActive) return { valid: false, error: 'Bu kupon artık aktif değil.' }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: 'Kuponun süresi dolmuş.' }
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'Kupon kullanım limiti dolmuş.' }
  }

  // İlk sipariş kuponu → üye girişi + daha önce ödenmiş sipariş olmamalı
  if (coupon.firstOrderOnly) {
    if (!userId) {
      return { valid: false, error: 'Bu kupon yalnızca üyelere özeldir. Lütfen giriş yapın veya üye olun.' }
    }
    const paidCount = await prisma.order.count({
      where: { userId, paidAt: { not: null } },
    })
    if (paidCount > 0) {
      return { valid: false, error: 'Bu kupon yalnızca ilk siparişinizde geçerlidir.' }
    }
  }

  const minOrder = coupon.minOrder ? parseFloat(coupon.minOrder.toString()) : 0
  if (cartTotal < minOrder) {
    return {
      valid: false,
      error: `Bu kupon için minimum sepet tutarı ₺${minOrder.toLocaleString('tr-TR')}.`,
    }
  }

  const value = parseFloat(coupon.value.toString())
  let discount = coupon.type === 'PERCENT' ? (cartTotal * value) / 100 : value
  discount = Math.min(discount, cartTotal) // sepet tutarını aşamaz
  discount = Math.round(discount * 100) / 100

  return { valid: true, couponId: coupon.id, code: coupon.code, discount }
}
