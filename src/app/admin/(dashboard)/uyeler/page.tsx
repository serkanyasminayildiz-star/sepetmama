import { prisma } from '@/lib/prisma'
import AdminShell from '../AdminShell'
import UyelerClient from './UyelerClient'

export default async function UyelerPage() {
  const [users, coupons] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        orders: { select: { total: true, paidAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, code: true, type: true, value: true, minOrder: true },
    }),
  ])

  const members = users.map((u) => {
    const paidOrders = u.orders.filter((o) => o.paidAt)
    const totalSpent = paidOrders.reduce((s, o) => s + parseFloat(o.total.toString()), 0)
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt,
      orderCount: paidOrders.length,
      totalSpent,
    }
  })

  return (
    <AdminShell>
      <UyelerClient
        members={JSON.parse(JSON.stringify(members))}
        coupons={JSON.parse(JSON.stringify(coupons))}
      />
    </AdminShell>
  )
}
