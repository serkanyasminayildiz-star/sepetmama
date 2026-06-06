import { prisma } from '@/lib/prisma'
import AdminShell from '../AdminShell'
import TerkEdilenClient from './TerkEdilenClient'

export default async function TerkEdilenPage() {
  const [unpaid, paidOrders, memberRows, coupons] = await Promise.all([
    prisma.order.findMany({
      where: { paidAt: null },
      select: {
        id: true,
        status: true,
        shippingFullName: true,
        shippingEmail: true,
        userId: true,
        total: true,
        createdAt: true,
        items: { select: { quantity: true, product: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({ where: { paidAt: { not: null } }, select: { shippingEmail: true } }),
    prisma.user.findMany({ where: { role: 'CUSTOMER' }, select: { email: true } }),
    prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, code: true, type: true, value: true, minOrder: true, firstOrderOnly: true },
    }),
  ])

  const paidEmails = new Set(paidOrders.map((o) => o.shippingEmail.toLowerCase()))
  const memberEmails = new Set(memberRows.map((m) => m.email.toLowerCase()))

  // E-posta bazında tekilleştir: en güncel denemeyi tut, satın almış olanları çıkar
  const seen = new Set<string>()
  const carts = unpaid
    .filter((o) => {
      const e = o.shippingEmail.toLowerCase()
      if (paidEmails.has(e)) return false // zaten satın almış, rahatsız etme
      if (seen.has(e)) return false
      seen.add(e)
      return true
    })
    .map((o) => {
      const e = o.shippingEmail.toLowerCase()
      const attempts = unpaid.filter((u) => u.shippingEmail.toLowerCase() === e).length
      return {
        orderId: o.id,
        name: o.shippingFullName,
        email: o.shippingEmail,
        isMember: memberEmails.has(e),
        total: parseFloat(o.total.toString()),
        createdAt: o.createdAt,
        attempts,
        items: o.items.map((i) => `${i.quantity}x ${i.product.name}`),
      }
    })

  return (
    <AdminShell>
      <TerkEdilenClient
        carts={JSON.parse(JSON.stringify(carts))}
        coupons={JSON.parse(JSON.stringify(coupons))}
      />
    </AdminShell>
  )
}
