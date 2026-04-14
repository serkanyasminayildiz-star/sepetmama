import { prisma } from '@/lib/prisma'
import AdminShell from '../AdminShell'
import MarkaClient from './MarkaClient'

export default async function MarkaPage() {
  const brands = await prisma.product.findMany({
    where: { brand: { not: null } },
    select: { brand: true },
    distinct: ['brand'],
    orderBy: { brand: 'asc' },
  })

  return (
    <AdminShell>
      <MarkaClient brands={brands.map(b => b.brand!).filter(Boolean)} />
    </AdminShell>
  )
}
