import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation, sendAdminNotification, sendRewardEmail } from '@/lib/email/send'
import { createRewardCoupon, REWARD_MIN_ORDER } from '@/lib/reward'

const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!

export async function GET() {
  return new NextResponse('OK')
}

export async function POST(req: NextRequest) {
  const body = await req.formData()
  const merchantOid = body.get('merchant_oid') as string | null
  const status = body.get('status') as string | null
  const totalAmount = body.get('total_amount') as string | null
  const hash = body.get('hash') as string | null
  const failedReasonMsg = (body.get('failed_reason_msg') as string | null) ?? null

  if (!merchantOid || !status || !totalAmount || !hash) {
    return new NextResponse('PAYTR notification failed: missing fields', { status: 400 })
  }

  const hashStr = `${merchantOid}${MERCHANT_SALT}${status}${totalAmount}`
  const expectedHash = crypto.createHmac('sha256', MERCHANT_KEY).update(hashStr).digest('base64')
  if (hash !== expectedHash) {
    return new NextResponse('PAYTR notification failed: bad hash', { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: merchantOid },
    include: { items: { include: { product: { select: { name: true } } } } },
  })

  if (!order) {
    return new NextResponse('OK')
  }

  if (order.status === 'CONFIRMED' || order.status === 'CANCELLED') {
    return new NextResponse('OK')
  }

  if (status === 'success') {
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
        // Kupon kullanıldıysa kullanım sayacını artır (sadece başarılı ödemede)
        if (order.couponId) {
          await tx.coupon.update({
            where: { id: order.couponId },
            data: { usedCount: { increment: 1 } },
          })
        }
      })
      stockOk = true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Stock update failed'
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', failedReason: `Post-payment stock failure: ${msg}` },
      })
    }

    // Email — sadece sipariş CONFIRMED olduğunda. Email hatası callback'i bozmaz.
    if (stockOk) {
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
      }
      await Promise.allSettled([
        sendOrderConfirmation(emailData),
        sendAdminNotification(emailData),
      ])

      // Sadık müşteri ödülü — sadece ÜYE + tutar eşiği tutuyorsa.
      // Hata sipariş/ödeme akışını bozmaz.
      if (order.userId) {
        try {
          const orderTotal = parseFloat(order.total.toString())
          const reward = await createRewardCoupon(order.userId, orderTotal)
          if (reward) {
            await sendRewardEmail(order.shippingEmail, {
              customerName: order.shippingFullName,
              code: reward.code,
              rewardValue: parseFloat(reward.value.toString()),
              minOrder: REWARD_MIN_ORDER,
              expiresText: reward.expiresAt
                ? `Son kullanım: ${reward.expiresAt.toLocaleDateString('tr-TR')}`
                : undefined,
              siteUrl: process.env.NEXTAUTH_URL || 'https://www.lezizmama.com',
            })
          }
        } catch (err) {
          console.error('[reward] ödül kuponu oluşturma/gönderme hatası:', err, 'order=', order.id)
        }
      }
    }
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED', failedReason: failedReasonMsg || `PayTR status: ${status}` },
    })
  }

  return new NextResponse('OK')
}
