import { prisma } from '@/lib/prisma'
import AdminShell from '../AdminShell'
import SiparislerClient from './SiparislerClient'

export default async function SiparislerPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>
}) {
  const sp = await searchParams

  const where: any = {}
  if (sp.durum) where.status = sp.durum

  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      status: true,
      total: true,
      shippingFee: true,
      createdAt: true,
      paidAt: true,
      failedReason: true,
      cargoCompany: true,
      cargoTrackingNo: true,
      shippingFullName: true,
      shippingEmail: true,
      shippingPhone: true,
      shippingAddress: true,
      user: { select: { name: true, email: true, phone: true } },
      address: { select: { fullName: true, phone: true, address: true, city: true, district: true } },
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              name: true,
              images: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <AdminShell>
      <SiparislerClient
        orders={JSON.parse(JSON.stringify(orders))}
        searchParams={sp}
      />
    </AdminShell>
  )
}
