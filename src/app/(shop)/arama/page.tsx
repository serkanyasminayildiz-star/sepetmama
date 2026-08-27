import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import Link from 'next/link'
import Header from '@/app/(home)/components/Header'
import Footer from '@/app/(home)/components/Footer'
import SearchGrid from './SearchGrid'
import SearchBox from './SearchBox'

interface PageProps {
  searchParams: Promise<{ q?: string; sayfa?: string }>
}

export const metadata = {
  title: 'Ürün Arama',
  robots: { index: false, follow: true },
}

export default async function AramaPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const query = (sp.q || '').trim()
  const page = Math.max(1, parseInt(sp.sayfa || '1') || 1)
  const perPage = 24
  const skip = (page - 1) * perPage

  // Kelime kelime ara: "royal kitten" → hem "royal" hem "kitten" geçen ürünler
  const terms = query.split(/\s+/).filter((t) => t.length >= 2).slice(0, 6)

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    AND: terms.map((t) => ({
      OR: [
        { name: { contains: t, mode: 'insensitive' as const } },
        { brand: { contains: t, mode: 'insensitive' as const } },
      ],
    })),
  }

  const [products, total] = terms.length
    ? await Promise.all([
        prisma.product.findMany({
          where,
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: perPage,
        }),
        prisma.product.count({ where }),
      ])
    : [[], 0]

  const totalPages = Math.ceil(total / perPage)

  // Decimal → number: client bileşenine serileştirilebilir veri geçir
  const items = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    salePrice: p.salePrice === null ? null : Number(p.salePrice),
    images: p.images.map((i) => ({ url: i.url })),
  }))

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <SearchBox initial={query} />

          {query && (
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-extrabold text-gray-800">{total}</span> sonuç bulundu
              {total > 0 && <> — &ldquo;{query}&rdquo;</>}
            </p>
          )}

          {!query ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-600 font-semibold">Aramak istediğiniz ürünü yazın</p>
            </div>
          ) : total === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🐾</p>
              <p className="text-xl font-extrabold text-gray-700 mb-2">Sonuç bulunamadı</p>
              <p className="text-gray-500 text-sm mb-6">
                &ldquo;{query}&rdquo; için ürün bulamadık. Farklı bir kelime deneyin.
              </p>
              <Link href="/" className="bg-gold hover:bg-gold-dark text-goldink font-extrabold px-6 py-3 rounded-2xl transition-colors">
                Tüm Ürünlere Göz At
              </Link>
            </div>
          ) : (
            <SearchGrid products={items} page={page} totalPages={totalPages} query={query} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
