import { prisma } from '@/lib/prisma'
import AdminShell from '../AdminShell'
import StokClient from './StokClient'

export default async function StokPage({
  searchParams,
}: {
  searchParams: Promise<{ tip?: string }>
}) {
  const sp = await searchParams
  const tip = sp.tip || 'tukendi'

  const where: any = { isActive: true }
  if (tip === 'tukendi') where.stock = 0
  if (tip === 'kritik') where.stock = { gt: 0, lte: 5 }
  if (tip === 'dusuk') where.stock = { gt: 5, lte: 10 }

  const [products, stokYok, kritik, dusuk, toplamAktif] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: 'asc' }, take: 1 }, categories: { include: { category: true }, take: 1 } },
      orderBy: { stock: 'asc' },
      take: 100,
    }),
    prisma.product.count({ where: { isActive: true, stock: 0 } }),
    prisma.product.count({ where: { isActive: true, stock: { gt: 0, lte: 5 } } }),
    prisma.product.count({ where: { isActive: true, stock: { gt: 5, lte: 10 } } }),
    prisma.product.count({ where: { isActive: true } }),
  ])

  return (
    <AdminShell>
      <StokClient
        products={JSON.parse(JSON.stringify(products))}
        istatistik={{ stokYok, kritik, dusuk, toplamAktif }}
        tip={tip}
      />
    </AdminShell>
  )
}
