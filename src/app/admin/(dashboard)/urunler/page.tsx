import { prisma } from '@/lib/prisma'
import AdminShell from '../AdminShell'
import UrunlerClient from './UrunlerClient'

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<{ sayfa?: string; arama?: string; marka?: string; kategori?: string; stok?: string }>
}) {
  const sp = await searchParams
  const sayfa = parseInt(sp.sayfa || '1')
  const perPage = 50
  const skip = (sayfa - 1) * perPage

  const where: any = {}
  if (sp.arama) where.name = { contains: sp.arama, mode: 'insensitive' }
  if (sp.marka) where.brand = sp.marka
  if (sp.stok === 'tukendi') where.stock = 0
  if (sp.stok === 'kritik') where.stock = { gt: 0, lte: 5 }
  if (sp.stok === 'stokta') where.stock = { gt: 0 }
  if (sp.kategori) where.categories = { some: { categoryId: sp.kategori } }

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        categories: { include: { category: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where: { brand: { not: null } },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    }),
  ])

  return (
    <AdminShell>
      <UrunlerClient
        products={JSON.parse(JSON.stringify(products))}
        total={total}
        sayfa={sayfa}
        totalPages={Math.ceil(total / perPage)}
        categories={JSON.parse(JSON.stringify(categories))}
        brands={brands.map((b) => b.brand!).filter(Boolean)}
        searchParams={sp}
      />
    </AdminShell>
  )
}
