import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { prepareOrder, type CartItemInput, type ShippingInput, type ConsentsInput } from '@/lib/order/prepare'
import { ONLINE_PAYMENT_ENABLED } from '@/lib/payment-config'
import {
  initCheckoutForm,
  IYZICO_CONFIGURED,
  IYZICO_CONSTANTS,
  type IyzicoBasketItem,
} from '@/lib/iyzico'

/**
 * iyzico Checkout Form başlatma.
 *
 * Sipariş PENDING olarak oluşturulur; CONFIRMED'e geçiş yalnızca
 * /api/iyzico/callback içinde, iyzico'dan doğrulama alındıktan sonra yapılır.
 * Stok düşümü de orada — ödeme alınmadan stok eksiltilmez.
 */
export async function POST(req: NextRequest) {
  if (!ONLINE_PAYMENT_ENABLED) {
    return NextResponse.json({ error: 'Online ödeme şu anda kullanılamıyor.' }, { status: 403 })
  }
  if (!IYZICO_CONFIGURED) {
    console.error('[iyzico] IYZICO_API_KEY / IYZICO_SECRET_KEY tanımlı değil')
    return NextResponse.json({ error: 'Ödeme altyapısı yapılandırılmamış.' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const items: CartItemInput[] = body.items
    const shipping: ShippingInput = body.shipping
    const consents: ConsentsInput = body.consents
    const couponCode: string = typeof body.couponCode === 'string' ? body.couponCode : ''
    const city: string = typeof body.city === 'string' ? body.city.trim() : ''

    if (!city) {
      return NextResponse.json({ error: 'İl bilgisi zorunludur.' }, { status: 400 })
    }

    const session = await auth()
    const userId = session?.user?.id ?? null

    const prepared = await prepareOrder(items, shipping, consents, couponCode, userId)
    if (!prepared.ok) {
      return NextResponse.json({ error: prepared.error }, { status: 400 })
    }
    const { cartTotal, grandTotal, shippingFee, discount, couponId, orderItemsData } = prepared.data

    const userIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    // Adres metnine il de yazılır (kargo etiketi tek alandan okunuyor)
    const fullAddress = `${shipping.address} / ${city}`

    const order = await prisma.order.create({
      data: {
        userId,
        shippingFullName: shipping.name,
        shippingEmail: shipping.email,
        shippingPhone: shipping.phone,
        shippingAddress: fullAddress,
        total: grandTotal,
        shippingFee,
        couponId,
        discount: discount > 0 ? discount : null,
        paymentMethod: 'ONLINE',
        consents: {
          kvkk: consents.kvkk,
          mesafeli: consents.mesafeli,
          acceptedAt: new Date().toISOString(),
          ip: userIp,
          userAgent,
        },
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: { select: { name: true } } } } },
    })

    // iyzico kuralı: basketItems fiyat toplamı `price` ile birebir eşleşmeli.
    // Kargo ve indirim `paidPrice` üzerinden yansıtılır.
    const basketItems: IyzicoBasketItem[] = order.items.map((item) => ({
      id: item.productId,
      name: item.product.name.substring(0, 100),
      category1: 'Evcil Hayvan Ürünleri',
      itemType: IYZICO_CONSTANTS.BASKET_ITEM_PHYSICAL,
      price: (parseFloat(item.price.toString()) * item.quantity).toFixed(2),
    }))

    // Yuvarlama farkı iyzico tarafından reddedilir → farkı son kaleme ekle
    const basketSum = basketItems.reduce((s, b) => s + parseFloat(b.price), 0)
    const priceStr = cartTotal.toFixed(2)
    const drift = Math.round((cartTotal - basketSum) * 100) / 100
    if (drift !== 0 && basketItems.length > 0) {
      const last = basketItems[basketItems.length - 1]
      last.price = (parseFloat(last.price) + drift).toFixed(2)
    }

    const nameParts = shipping.name.trim().split(/\s+/)
    const surname = nameParts.length > 1 ? nameParts.pop()! : shipping.name
    const firstName = nameParts.join(' ') || shipping.name

    const siteUrl = process.env.NEXTAUTH_URL || 'https://www.lezizmama.com'

    const result = await initCheckoutForm({
      locale: IYZICO_CONSTANTS.LOCALE_TR,
      conversationId: order.id,
      price: priceStr,
      paidPrice: grandTotal.toFixed(2),
      currency: IYZICO_CONSTANTS.CURRENCY_TRY,
      basketId: order.id,
      paymentGroup: IYZICO_CONSTANTS.PAYMENT_GROUP_PRODUCT,
      callbackUrl: `${siteUrl}/api/iyzico/callback`,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: userId || `guest-${order.id}`,
        name: firstName,
        surname,
        gsmNumber: shipping.phone,
        email: shipping.email,
        // TCKN toplamıyoruz; iyzico alanı zorunlu tuttuğu için standart dolgu
        identityNumber: '11111111111',
        registrationAddress: fullAddress,
        ip: userIp,
        city,
        country: 'Turkey',
      },
      shippingAddress: { contactName: shipping.name, city, country: 'Turkey', address: fullAddress },
      billingAddress: { contactName: shipping.name, city, country: 'Turkey', address: fullAddress },
      basketItems,
    })

    if (result.status !== 'success' || !result.paymentPageUrl) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          failedReason: `iyzico init: ${result.errorCode || ''} ${result.errorMessage || 'bilinmeyen hata'}`.trim(),
        },
      })
      console.error('[iyzico] init başarısız:', result.errorCode, result.errorMessage, 'order=', order.id)
      return NextResponse.json(
        { error: result.errorMessage || 'Ödeme başlatılamadı.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ paymentPageUrl: result.paymentPageUrl, orderId: order.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Beklenmedik hata'
    console.error('[iyzico] init hatası:', msg)
    return NextResponse.json({ error: 'Ödeme başlatılamadı. Lütfen tekrar deneyin.' }, { status: 500 })
  }
}
