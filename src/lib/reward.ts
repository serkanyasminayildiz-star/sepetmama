import { prisma } from '@/lib/prisma'

// Sadık müşteri ödül kuralı:
//   3.000₺+ harcama → 150₺ ödül kuponu
//   5.000₺+ harcama → 200₺ ödül kuponu
// Kupon: hesaba özel (userId), tek kullanım, min 1.000₺ sepette, 60 gün geçerli.
export const REWARD_MIN_ORDER = 1000
export const REWARD_VALID_DAYS = 60

export function computeRewardValue(orderTotal: number): number {
  if (orderTotal >= 5000) return 200
  if (orderTotal >= 3000) return 150
  return 0
}

/**
 * Ödenmiş sipariş sonrası, üye için hak edilen ödül kuponunu oluşturur.
 * Tutar eşiği tutmuyorsa null döner. Çağıran tarafta try/catch ile sarılmalı
 * (ödül oluşturma hatası sipariş/ödeme akışını bozmamalı).
 */
export async function createRewardCoupon(userId: string, orderTotal: number) {
  const value = computeRewardValue(orderTotal)
  if (value <= 0) return null

  // Çakışma ihtimali yok denecek kadar düşük benzersiz kod
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
  const code = `ODUL${value}-${suffix}`
  const expiresAt = new Date(Date.now() + REWARD_VALID_DAYS * 24 * 60 * 60 * 1000)

  return prisma.coupon.create({
    data: {
      code,
      type: 'FIXED',
      value,
      minOrder: REWARD_MIN_ORDER,
      maxUses: 1,
      isActive: true,
      firstOrderOnly: false,
      userId,
      expiresAt,
    },
  })
}
