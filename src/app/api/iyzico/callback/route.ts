import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { retrieveCheckoutForm } from '@/lib/iyzico'
import { sendOrderConfirmation, sendAdminNotification, sendRewardEmail } from '@/lib/email/send'
import { createRewardCoupon, REWARD_MIN_ORDER } from '@/lib/reward'

/**
 * iyzico ödeme dönüşü.
 *
 * iyzico bu adrese POST atar VE kullanıcıyı buraya yönlendirir; bu yüzden
 * sonunda tarayıcıyı sonuç sayfasına redirect ediyoruz.
 *
 * Güvenlik: POST gövdesindeki veriye güvenilmez. Ödeme durumu ve tutar
 * yalnızca iyzico'ya `retrieve` çağrısı yapılarak doğrulanır.
 */
export async function POST(req: NextRequest) {
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.lezizmama.com'

  let token = ''
  try {
    const form = await req.formData()
    token = (form.get('token') as string | null) ?? ''
  } catch {
    // gövde okunamadıysa aşağıda token boş kalır
  }

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz`, { status: 303 })
  }

  let result
  try {
    result = await retrieveCheckoutForm(token)
  } catch (err) {
    console.error('[iyzico] retrieve hatası:', err)
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz`, { status: 303 })
  }

  const orderId = result.basketId || result.conversationId
  if (!orderId) {
    console.error('[iyzico] callback: sipariş id yok', result.errorCode, result.errorMessage)
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz`, { status: 303 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { name: true } } } } },
  })
  if (!order) {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz`, { status: 303 })
  }

  // Aynı callback iki kez gelirse stok iki kez düşmesin
  if (order.status === 'CONFIRMED') {
    return NextResponse.redirect(`${siteUrl}/odeme/basarili?orderId=${order.id}`, { status: 303 })
  }
  if (order.status === 'CANCELLED') {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?orderId=${order.id}`, { status: 303 })
  }

  const paymentOk = result.status === 'success' && result.paymentStatus === 'SUCCESS'

  if (!paymentOk) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        failedReason: `iyzico: ${result.errorCode || ''} ${result.errorMessage || result.paymentStatus || 'ödeme başarısız'}`.trim(),
      },
    })
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?orderId=${order.id}`, { status: 303 })
  }

  // Tutar doğrulaması: iyzico'nun tahsil ettiği tutar siparişle eşleşmeli
  const paid = parseFloat(result.paidPrice || '0')
  const expected = parseFloat(order.total.toString())
  if (Math.abs(paid - expected) > 0.01) {
    console.error('[iyzico] tutar uyuşmazlığı:', { orderId: order.id, paid, expected })
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED', failedReason: `Tutar uyuşmazlığı: ödenen ${paid}, beklenen ${expected}` },
    })
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?orderId=${order.id}`, { status: 303 })
  }

  let stockOk = false
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })
        if (updated.count === 0) {
          throw new Error(`Stok yetersiz (productId: ${item.productId})`)
        }
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED', paidAt: new Date() },
      })
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { increment: 1 } },
        })
      }
    })
    stockOk = true
  } catch (err) {
    // Ödeme alındı ama stok düşemedi — sipariş iptal edilmez, elle çözülmek üzere işaretlenir
    const msg = err instanceof Error ? err.message : 'Stok güncelleme hatası'
    console.error('[iyzico] ödeme sonrası stok hatası:', msg, 'order=', order.id)
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED', paidAt: new Date(), failedReason: `Ödeme alındı, stok düşülemedi: ${msg}` },
    })
  }

  const emailData = {
    orderId: order.id,
    total: parseFloat(order.total.toString()),
    shippingFee: parseFloat(order.shippingFee.toString()),
    customerName: order.shippingFullName,
    customerEmail: order.shippingEmail,
    customerPhone: order.shippingPhone,
    shippingAddress: order.shippingAddress,
    items: order.items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      price: parseFloat(i.price.toString()),
    })),
    isLoggedInUser: !!order.userId,
    siteUrl,
  }
  await Promise.allSettled([sendOrderConfirmation(emailData), sendAdminNotification(emailData)])

  if (stockOk && order.userId) {
    try {
      const reward = await createRewardCoupon(order.userId, parseFloat(order.total.toString()))
      if (reward) {
        await sendRewardEmail(order.shippingEmail, {
          customerName: order.shippingFullName,
          code: reward.code,
          rewardValue: parseFloat(reward.value.toString()),
          minOrder: REWARD_MIN_ORDER,
          expiresText: reward.expiresAt
            ? `Son kullanım: ${reward.expiresAt.toLocaleDateString('tr-TR')}`
            : undefined,
          siteUrl,
        })
      }
    } catch (err) {
      console.error('[reward] ödül kuponu hatası:', err, 'order=', order.id)
    }
  }

  return NextResponse.redirect(`${siteUrl}/odeme/basarili?orderId=${order.id}`, { status: 303 })
}

export async function GET() {
  return new NextResponse('OK')
}
