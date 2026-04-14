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

async function getAllCategoryIds(parentId: string): Promise<string[]> {
  const children = await prisma.category.findMany({ where: { parentId } })
  const ids = [parentId]
  for (const child of children) {
    const childIds = await getAllCategoryIds(child.id)
    ids.push(...childIds)
  }
  return ids
}

export default async function KategoriPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true, parent: true },
  })

  if (!category) notFound()

  const categoryIds = await getAllCategoryIds(category.id)
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
    prisma.product.findMany({ where, include: { images: { orderBy: { order: 'asc' }, take: 1 } }, orderBy: { createdAt: 'desc' }, skip, take: perPage }),
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-orange-500">Ana Sayfa</Link>
          <span>/</span>
          {category.parent && (
            <>
              <Link href={`/kategori/${category.parent.slug}`} className="hover:text-orange-500">{category.parent.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-orange-500 font-semibold">{category.name}</span>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-gray-800">{category.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{total} ürün bulundu</p>
        </div>

        <div className="flex gap-6">
          <div className="hidden md:block w-56 flex-shrink-0">
            {category.children.length > 0 && (
              <div className="bg-white rounded-2xl border border-orange-100 p-4 mb-4">
                <h3 className="font-extrabold text-gray-800 mb-3 text-sm">Alt Kategoriler</h3>
                <div className="flex flex-col gap-1">
                  {category.children.map((sub) => (
                    <Link key={sub.id} href={`/kategori/${sub.slug}`} className="text-sm text-gray-600 hover:text-orange-500 hover:font-semibold transition-all py-1 border-b border-gray-50 last:border-0">
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <Filters searchParams={sp} brands={brands} />
          </div>

          {category.children.length > 0 && (
            <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide w-full">
              {category.children.map((sub) => (
                <Link key={sub.id} href={`/kategori/${sub.slug}`} className="px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap border-2 bg-orange-50 text-orange-500 border-orange-200 flex-shrink-0">
                  {sub.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex-1">
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
    title: `${category?.name || 'Kategori'} | sePetMama`,
    description: `${category?.name} ürünleri sePetMama'da`,
  }
}
