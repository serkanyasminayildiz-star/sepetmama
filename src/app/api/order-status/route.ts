import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint — basarili sayfası PENDING durumda polling yapsın diye.
// orderId zaten URL'de açık olduğu için güvenlik için sadece status + total + items dönüyoruz.
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) {
    return NextResponse.json({ error: 'orderId gerekli' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      total: true,
      items: {
        select: {
          quantity: true,
          price: true,
          product: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  return NextResponse.json({
    status: order.status,
    value: parseFloat(order.total.toString()),
    items: order.items.map((i) => ({
      item_id: i.product.id,
      item_name: i.product.name,
      price: parseFloat(i.price.toString()),
      quantity: i.quantity,
    })),
  })
}
