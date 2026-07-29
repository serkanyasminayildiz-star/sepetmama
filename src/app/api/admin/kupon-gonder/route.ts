import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { sendCouponEmail } from '@/lib/email/send'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return false
  return true
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const body = await req.json()
  const userIds: string[] = Array.isArray(body.userIds) ? body.userIds : []
  const couponCode: string = typeof body.couponCode === 'string' ? body.couponCode.trim().toUpperCase() : ''

  if (userIds.length === 0) {
    return NextResponse.json({ error: 'En az bir üye seçin.' }, { status: 400 })
  }
  if (!couponCode) {
    return NextResponse.json({ error: 'Kupon seçin.' }, { status: 400 })
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
  if (!coupon) {
    return NextResponse.json({ error: 'Kupon bulunamadı.' }, { status: 404 })
  }

  const value = parseFloat(coupon.value.toString())
  const discountText = coupon.type === 'PERCENT' ? `%${value} indirim` : `₺${value} indirim`
  const minOrder = coupon.minOrder ? parseFloat(coupon.minOrder.toString()) : 0
  const minOrderText = minOrder > 0 ? `Min. ₺${minOrder.toLocaleString('tr-TR')} sepet tutarı` : undefined
  const expiresText = coupon.expiresAt
    ? `Son kullanım: ${coupon.expiresAt.toLocaleDateString('tr-TR')}`
    : undefined
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.sepetmama.com'

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { name: true, email: true },
  })

  const results = await Promise.allSettled(
    users.map((u) =>
      sendCouponEmail(u.email, {
        customerName: u.name || '',
        code: coupon.code,
        discountText,
        minOrderText,
        expiresText,
        siteUrl,
      })
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled' && r.value === true).length
  const failed = users.length - sent

  return NextResponse.json({ sent, failed, total: users.length })
}
