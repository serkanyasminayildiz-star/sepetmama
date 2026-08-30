import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { prepareOrder, type CartItemInput, type ShippingInput, type ConsentsInput } from '@/lib/order/prepare'
import { sendOrderConfirmation, sendAdminNotification } from '@/lib/email/send'

/**
 * Kapıda ödeme siparişi.
 *
 * Online ödemeden farkı: ödeme sağlayıcısı yok, tahsilat teslimatta yapılır.
 * Bu yüzden sipariş doğrudan CONFIRMED olur ama `paidAt` boş kalır —
 * ödeme alındığında admin panelinden işaretlenir.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items: CartItemInput[] = body.items
    const shipping: ShippingInput = body.shipping
    const consents: ConsentsInput = body.consents
    const couponCode: string = typeof body.couponCode === 'string' ? body.couponCode : ''

    const session = await auth()
    const userId = session?.user?.id ?? null

    const prepared = await prepareOrder(items, shipping, consents, couponCode, userId)
    if (!prepared.ok) {
      return NextResponse.json({ error: prepared.error }, { status: 400 })
    }
    const { grandTotal, shippingFee, discount, couponId, orderItemsData } = prepared.data

    const userIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    // Sipariş + stok + kupon sayacı tek transaction'da.
    // Stok yarışını updateMany koşuluyla önlüyoruz (online akıştaki desenle aynı).
    let orderId: string
    try {
      orderId = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
            shippingFullName: shipping.name,
            shippingEmail: shipping.email,
            shippingPhone: shipping.phone,
            shippingAddress: shipping.address,
            total: grandTotal,
            shippingFee,
            couponId,
            discount: discount > 0 ? discount : null,
            status: 'CONFIRMED',
            paymentMethod: 'CASH_ON_DELIVERY',
            consents: {
              kvkk: consents.kvkk,
              mesafeli: consents.mesafeli,
              acceptedAt: new Date().toISOString(),
              ip: userIp,
              userAgent,
            },
            items: { create: orderItemsData },
          },
        })

        for (const item of orderItemsData) {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          })
          if (updated.count === 0) {
            throw new Error('STOK_YETERSIZ')
          }
        }

        if (couponId) {
          await tx.coupon.update({
            where: { id: couponId },
            data: { usedCount: { increment: 1 } },
          })
        }

        return order.id
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'STOK_YETERSIZ') {
        return NextResponse.json(
          { error: 'Sepetinizdeki bir ürünün stoğu az önce tükendi. Lütfen sepetinizi güncelleyin.' },
          { status: 409 }
        )
      }
      throw err
    }

    // E-posta hatası siparişi bozmaz (sipariş zaten oluştu).
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: { select: { name: true } } } } },
    })
    if (order) {
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
        siteUrl: process.env.NEXTAUTH_URL || 'https://www.lezizmama.com',
        isCashOnDelivery: true,
      }
      await Promise.allSettled([
        sendOrderConfirmation(emailData),
        sendAdminNotification(emailData),
      ])
    }

    return NextResponse.json({ orderId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Beklenmedik hata'
    console.error('[kapida] sipariş hatası:', msg)
    return NextResponse.json({ error: 'Sipariş oluşturulamadı. Lütfen tekrar deneyin.' }, { status: 500 })
  }
}
