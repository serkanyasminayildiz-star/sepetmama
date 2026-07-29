import Header from './components/Header'
import CircleStrip from './components/CircleStrip'
import HeroBanner from './components/HeroBanner'
import Footer from './components/Footer'
import HomeProductCard from './components/HomeProductCard'
import AutoScrollRow from './components/AutoScrollRow'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getProducts(categorySlug: string, take = 10) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: { children: true },
  })
  if (!category) return []
  const categoryIds = [category.id, ...category.children.map((c) => c.id)]
  return prisma.product.findMany({
    where: { isActive: true, categories: { some: { categoryId: { in: categoryIds } } } },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
    take,
  })
}

async function getFeaturedProducts(take = 12) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
    take,
  })
}

function mapProduct(p: Awaited<ReturnType<typeof getProducts>>[number]) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: parseFloat(p.price.toString()),
    salePrice: p.salePrice ? parseFloat(p.salePrice.toString()) : undefined,
    image: p.images[0]?.url,
    tag: p.tag,
  }
}

async function FeaturedSection() {
  const products = await getFeaturedProducts(12)
  if (products.length === 0) return null
  return (
    <section className="px-3 md:px-4 py-3 md:py-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[15px] font-extrabold text-gray-800">⭐ Öne Çıkan Ürünler</h2>
      </div>
      <AutoScrollRow products={products.map(mapProduct)} />
    </section>
  )
}

async function ProductSection({ title, categorySlug, href }: {
  title: string; categorySlug: string; href: string
}) {
  const products = await getProducts(categorySlug)
  if (products.length === 0) return null

  return (
    <section className="px-3 md:px-4 py-3 md:py-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[15px] font-extrabold text-gray-800">{title}</h2>
        <Link href={href} className="text-xs font-extrabold text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 hover:bg-orange-100 transition-colors">
          Tümünü Gör →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        {products.map((product) => (
          <HomeProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            name={product.name}
            price={parseFloat(product.price.toString())}
            salePrice={product.salePrice ? parseFloat(product.salePrice.toString()) : undefined}
            image={product.images[0]?.url}
            tag={product.tag}
          />
        ))}
      </div>
    </section>
  )
}

const TABS = [
  { label: '🐱 Kedi Maması', href: '/kategori/yetiskin-kedi-mamasi-1-7-yas' },
  { label: '🐈 Yavru Kedi', href: '/kategori/yavru-kedi-mamalari' },
  { label: '🥫 Kedi Konserve', href: '/kategori/yetiskin-kedi-konservesi' },
  { label: '🐶 Köpek Maması', href: '/kategori/yetiskin-kopek-mamasi' },
  { label: '🐕 Yavru Köpek', href: '/kategori/yavru-kopek-mamasi' },
  { label: '🦴 Köpek Ödülü', href: '/kategori/kopek-odulleri' },
]

export default async function HomePage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />
      <CircleStrip />
      <HeroBanner />

      {/* Kategori butonları */}
      <div className="bg-white px-3 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-b border-gray-100" style={{ WebkitOverflowScrolling: 'touch' }}>
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href}
            className="px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap border-2 flex-shrink-0 bg-orange-50 text-orange-500 border-orange-200 active:bg-orange-500 active:text-white hover:bg-orange-100 transition-colors">
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Öne çıkan ürünler slider */}
      <FeaturedSection />

      <div className="mx-3 md:mx-4 my-2 bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl px-5 py-3.5 flex justify-between items-center">
        <div>
          <p className="text-sm font-extrabold text-white">🎉 İlk Siparişe %10 İndirim!</p>
          <p className="text-[10px] text-blue-100 mt-0.5">SEPETMAMA10 kupon kodunu kullan · Min. 200₺</p>
        </div>
        <button className="bg-white text-blue-700 text-xs font-extrabold px-3.5 py-2 rounded-xl whitespace-nowrap hover:bg-blue-50 transition-colors">Hemen Al</button>
      </div>

      {/* 6 kategori section */}
      <ProductSection title="🐱 Kedi Kuru Mamaları" categorySlug="yetiskin-kedi-mamasi-1-7-yas" href="/kategori/yetiskin-kedi-mamasi-1-7-yas" />
      <ProductSection title="🐈 Yavru Kedi Mamaları" categorySlug="yavru-kedi-mamalari" href="/kategori/yavru-kedi-mamalari" />
      <ProductSection title="🥫 Kedi Konserveleri" categorySlug="yetiskin-kedi-konservesi" href="/kategori/yetiskin-kedi-konservesi" />
      <ProductSection title="🐶 Köpek Kuru Mamaları" categorySlug="yetiskin-kopek-mamasi" href="/kategori/yetiskin-kopek-mamasi" />
      <ProductSection title="🐕 Yavru Köpek Mamaları" categorySlug="yavru-kopek-mamasi" href="/kategori/yavru-kopek-mamasi" />
      <ProductSection title="🦴 Köpek Ödülleri" categorySlug="kopek-odulleri" href="/kategori/kopek-odulleri" />

      <Footer />
    </main>
  )
}
