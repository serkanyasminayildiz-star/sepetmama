import { prisma } from '@/lib/prisma'
import type { Prisma, OrderStatus } from '@prisma/client'
import AdminShell from '../AdminShell'
import SiparislerClient from './SiparislerClient'

export default async function SiparislerPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>
}) {
  const sp = await searchParams

  // Varsayılan liste = gerçek siparişler. Ödeme sayfasını açıp vazgeçen her
  // ziyaretçi PENDING kayıt bırakıyor, başarısız denemeler de CANCELLED oluyor;
  // bunlar listeyi şişirip gerçek siparişleri gizliyordu. İkisine de kendi
  // sekmesinden ulaşılır.
  const where: Prisma.OrderWhereInput = sp.durum
    ? { status: sp.durum as OrderStatus }
    : { status: { notIn: ['PENDING', 'CANCELLED'] } }

  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      status: true,
      total: true,
      shippingFee: true,
      createdAt: true,
      paidAt: true,
      paymentMethod: true,
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
