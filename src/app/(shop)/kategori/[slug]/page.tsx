import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductGrid from './ProductGrid'
import Filters from './Filters'
import Header from '@/app/(home)/components/Header'
import Footer from '@/app/(home)/components/Footer'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ min?: string; max?: string; sayfa?: string; marka?: string }>
}

export default async function KategoriPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  // Tüm kategorileri tek sorguda çek
  const [category, allCategories] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: { children: true, parent: true },
    }),
    prisma.category.findMany({ select: { id: true, parentId: true } }),
  ])

  if (!category) notFound()

  // Recursive ID toplama - DB'ye gitmeden memory'de yap
  const getAllIds = (parentId: string): string[] => {
    const ids = [parentId]
    const children = allCategories.filter(c => c.parentId === parentId)
    for (const child of children) {
      ids.push(...getAllIds(child.id))
    }
    return ids
  }

  const categoryIds = getAllIds(category.id)
  const page = parseInt(sp.sayfa || '1')
  const perPage = 24
  const skip = (page - 1) * perPage

  const where: any = {
    isActive: true,
    categories: { some: { categoryId: { in: categoryIds } } },
    ...(sp.min || sp.max ? { price: { ...(sp.min ? { gte: parseFloat(sp.min) } : {}), ...(sp.max ? { lte: parseFloat(sp.max) } : {}) } } : {}),
    ...(sp.marka ? { brand: sp.marka } : {}),
  }

  const [products, total, brandList] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where: { isActive: true, categories: { some: { categoryId: { in: categoryIds } } }, brand: { not: null } },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    }),
  ])

  const brands = brandList.map((b) => b.brand).filter(Boolean) as string[]
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">

        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-orange-500 flex-shrink-0">Ana Sayfa</Link>
          <span>/</span>
          {category.parent && (
            <>
              <Link href={`/kategori/${category.parent.slug}`} className="hover:text-orange-500 flex-shrink-0">{category.parent.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-orange-500 font-semibold flex-shrink-0">{category.name}</span>
        </div>

        <div className="mb-3">
          <h1 className="text-lg md:text-2xl font-extrabold text-gray-800">{category.name}</h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">{total} ürün bulundu</p>
        </div>

        {category.children.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
            {category.children.map((sub) => (
              <Link key={sub.id} href={`/kategori/${sub.slug}`}
                className="px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap border-2 bg-orange-50 text-orange-500 border-orange-200 flex-shrink-0 hover:bg-orange-100 transition-colors">
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex gap-4 md:gap-6">
          <div className="hidden md:block w-56 flex-shrink-0">
            <Filters searchParams={sp} brands={brands} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="md:hidden mb-3">
              <Filters searchParams={sp} brands={brands} mobile={true} />
            </div>
            <ProductGrid products={products} total={total} page={page} totalPages={totalPages} slug={slug} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  return {
    title: `${category?.name || 'Kategori'} | SepetMama`,
    description: `${category?.name} ürünleri SepetMama'da`,
  }
}
