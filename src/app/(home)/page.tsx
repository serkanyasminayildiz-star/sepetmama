import Header from './components/Header'
import CircleStrip from './components/CircleStrip'
import HeroBanner from './components/HeroBanner'
import Footer from './components/Footer'
import HomeProductCard from './components/HomeProductCard'
import AutoScrollRow from './components/AutoScrollRow'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function ProductSection({ title, categorySlug, href, autoScroll = false }: { title: string; categorySlug: string; href: string; autoScroll?: boolean }) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: { children: true },
  })

  if (!category) return null

  const categoryIds = [category.id, ...category.children.map((c) => c.id)]

  const products = await prisma.product.findMany({
    where: { isActive: true, categories: { some: { categoryId: { in: categoryIds } } } },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (products.length === 0) return null

  const cards = products.map((product) => {
    const price = parseFloat(product.price.toString())
    const salePrice = product.salePrice ? parseFloat(product.salePrice.toString()) : null
    return (
      <HomeProductCard
        key={product.id}
        id={product.id}
        slug={product.slug}
        name={product.name}
        price={price}
        salePrice={salePrice ?? undefined}
        image={product.images[0]?.url}
      />
    )
  })

  return (
    <section className="px-4 py-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[15px] font-extrabold text-gray-800">{title}</h2>
        <Link href={href} className="text-xs font-extrabold text-orange-500">Tümünü Gör →</Link>
      </div>
      {autoScroll ? (
        <AutoScrollRow>{cards}</AutoScrollRow>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">{cards}</div>
      )}
    </section>
  )
}

export default async function HomePage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />
      <CircleStrip />
      <HeroBanner />

      <div className="bg-white px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide justify-center">
        {[
          { label: '🐱 Kedi Mamaları', href: '/kategori/kedi-kuru-mamasi' },
          { label: '🐶 Köpek Mamaları', href: '/kategori/kopek-kuru-mamasi' },
          { label: '🦜 Kuş Yemi', href: '/kategori/kus-yemi' },
          { label: '🐠 Balık Yemi', href: '/kategori/balik-yemi' },
          { label: '🧸 Aksesuarlar', href: '/kategori/kopek-aksesuarlari' },
        ].map((tab, i) => (
          <Link key={tab.label} href={tab.href} className={`px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap border-2 transition-all ${i === 0 ? 'bg-orange-500 text-white border-orange-500' : 'bg-orange-50 text-orange-500 border-orange-200'}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <ProductSection title="🔥 Çok Satanlar" categorySlug="yetiskin-kopek-mamasi" href="/kategori/kopek" autoScroll={true} />

      <div className="mx-4 my-1 bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl px-5 py-3.5 flex justify-between items-center">
        <div>
          <p className="text-sm font-extrabold text-white">🎉 İlk Siparişe %10 İndirim!</p>
          <p className="text-[10px] text-blue-100 mt-0.5">SEPETMAMA10 kupon kodunu kullan · Min. 200₺</p>
        </div>
        <button className="bg-white text-blue-700 text-xs font-extrabold px-3.5 py-2 rounded-xl whitespace-nowrap hover:bg-blue-50 transition-colors">Hemen Al</button>
      </div>

      <ProductSection title="🐱 Kedi Mamaları" categorySlug="kedi-kuru-mamasi" href="/kategori/kedi-kuru-mamasi" />
      <ProductSection title="🐶 Köpek Mamaları" categorySlug="kopek-kuru-mamasi" href="/kategori/kopek-kuru-mamasi" />
      <ProductSection title="🥫 Kedi Konserveleri" categorySlug="kedi-konserve-mamasi" href="/kategori/kedi-konserve-mamasi" />
      <ProductSection title="🦴 Köpek Ödülleri" categorySlug="kopek-odulleri" href="/kategori/kopek-odulleri" />

      <Footer />
    </main>
  )
}
