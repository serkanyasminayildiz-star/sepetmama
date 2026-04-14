import { prisma } from '@/lib/prisma'
import AdminShell from '../AdminShell'
import KuponlarClient from './KuponlarClient'

export default async function KuponlarPage() {
  const kuponlar = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <AdminShell>
      <KuponlarClient kuponlar={JSON.parse(JSON.stringify(kuponlar))} />
    </AdminShell>
  )
}
