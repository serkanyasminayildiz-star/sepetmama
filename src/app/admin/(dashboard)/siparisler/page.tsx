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
    include: {
      user: { select: { name: true, email: true, phone: true } },
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { order: 'asc' }, take: 1 },
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
