import { prisma } from '@/lib/prisma'
import { validateAndComputeCoupon } from '@/lib/coupon'

export const FREE_SHIPPING_THRESHOLD = 1000
export const SHIPPING_FEE = 49.9

export interface CartItemInput {
  id: string
  quantity: number
}

export interface ShippingInput {
  name: string
  email: string
  phone: string
  address: string
}

export interface ConsentsInput {
  kvkk: boolean
  mesafeli: boolean
}

export interface PreparedOrder {
  userId: string | null
  cartTotal: number
  discount: number
  shippingFee: number
  grandTotal: number
  couponId: string | null
  orderItemsData: { productId: string; quantity: number; price: number }[]
  /** PayTR user_basket için: [ad, fiyat, adet] */
  basketLines: [string, string, number][]
}

/**
 * Sepeti sunucu tarafında doğrular ve tutarları DB fiyatlarından hesaplar.
 * Client'tan gelen fiyata/indirime asla güvenilmez.
 *
 * Hem online ödeme (PayTR/yeni PSP) hem kapıda ödeme aynı fonksiyonu kullanır;
 * fiyat, stok, kupon ve kargo kuralları tek yerde kalsın diye.
 */
export async function prepareOrder(
  items: CartItemInput[],
  shipping: ShippingInput,
  consents: ConsentsInput,
  couponCode: string,
  userId: string | null
): Promise<{ ok: true; data: PreparedOrder } | { ok: false; error: string }> {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Sepet boş.' }
  }
  if (!shipping?.name || !shipping?.email || !shipping?.phone || !shipping?.address) {
    return { ok: false, error: 'Tüm teslimat bilgileri zorunludur.' }
  }
  if (!consents?.kvkk || !consents?.mesafeli) {
    return { ok: false, error: 'KVKK ve Mesafeli Satış Sözleşmesi onayı zorunludur.' }
  }

  const itemIds = items.map((i) => i.id)
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: itemIds }, isActive: true },
  })

  if (dbProducts.length !== itemIds.length) {
    return { ok: false, error: 'Sepetteki bazı ürünler artık mevcut değil.' }
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]))
  let cartTotal = 0
  const orderItemsData: { productId: string; quantity: number; price: number }[] = []
  const basketLines: [string, string, number][] = []

  for (const item of items) {
    const product = productMap.get(item.id)
    if (!product) {
      return { ok: false, error: `Ürün bulunamadı: ${item.id}` }
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return { ok: false, error: 'Geçersiz miktar.' }
    }
    if (product.stock < item.quantity) {
      return { ok: false, error: `Stok yetersiz: ${product.name} (kalan: ${product.stock})` }
    }
    const effectivePrice = product.salePrice
      ? parseFloat(product.salePrice.toString())
      : parseFloat(product.price.toString())
    cartTotal += effectivePrice * item.quantity
    orderItemsData.push({ productId: product.id, quantity: item.quantity, price: effectivePrice })
    basketLines.push([product.name.substring(0, 100), effectivePrice.toFixed(2), item.quantity])
  }

  // Kupon sunucuda, DB fiyatlarından hesaplanan cartTotal ile yeniden doğrulanır.
  let couponId: string | null = null
  let discount = 0
  if (couponCode.trim()) {
    const couponResult = await validateAndComputeCoupon(couponCode, cartTotal, userId)
    if (!couponResult.valid) {
      return { ok: false, error: couponResult.error ?? 'Kupon geçersiz.' }
    }
    couponId = couponResult.couponId ?? null
    discount = couponResult.discount ?? 0
  }

  // Ücretsiz kargo eşiği indirim ÖNCESİ sepet tutarına göre belirlenir.
  const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const grandTotal = Math.round((cartTotal - discount + shippingFee) * 100) / 100

  return {
    ok: true,
    data: { userId, cartTotal, discount, shippingFee, grandTotal, couponId, orderItemsData, basketLines },
  }
}
