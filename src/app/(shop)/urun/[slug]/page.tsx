import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Header from '@/app/(home)/components/Header'
import Footer from '@/app/(home)/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import ProductGrid from '@/app/(shop)/kategori/[slug]/ProductGrid'
import AddToCartButton from './AddToCartButton'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function UrunPage({ params }: PageProps) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: 'asc' } },
      categories: { include: { category: true } },
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!product) notFound()

  const price = parseFloat(product.price.toString())
  const salePrice = product.salePrice ? parseFloat(product.salePrice.toString()) : null
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : null
  const displayPrice = salePrice ?? price

  // İlk kategori
  const firstCategory = product.categories[0]?.category

  // Benzer ürünler
  const similarProducts = firstCategory ? await prisma.product.findMany({
    where: {
      isActive: true,
      slug: { not: slug },
      categories: { some: { categoryId: firstCategory.id } },
    },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    take: 6,
  }) : []

  // Ortalama puan
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-orange-500">Ana Sayfa</Link>
          <span>/</span>
          {firstCategory && (
            <>
              <Link href={`/kategori/${firstCategory.slug}`} className="hover:text-orange-500">{firstCategory.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-orange-500 font-semibold line-clamp-1">{product.name}</span>
        </div>

        {/* Ürün ana bölümü */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Görseller */}
            <div>
              <div className="relative h-[320px] md:h-[400px] bg-orange-50 rounded-2xl overflow-hidden mb-3">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🐾</div>
                )}
                {discount && (
                  <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-extrabold px-2 py-1 rounded-lg">
                    %{discount} İndirim
                  </span>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {product.images.slice(1).map((img, i) => (
                    <div key={i} className="relative w-16 h-16 flex-shrink-0 bg-orange-50 rounded-xl overflow-hidden border-2 border-orange-100">
                      <Image src={img.url} alt={product.name} fill className="object-contain p-1" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bilgiler */}
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-800 leading-tight mb-2">{product.name}</h1>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className={`text-lg ${s <= Math.round(avgRating) ? 'text-orange-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">({product.reviews.length} yorum)</span>
                  </div>
                )}
              </div>

              {/* Fiyat */}
              <div className="bg-orange-50 rounded-2xl p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-orange-500">
                    ₺{displayPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {salePrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ₺{price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                {salePrice && (
                  <p className="text-sm text-orange-600 font-semibold mt-1">
                    ₺{(price - salePrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} tasarruf ettiniz!
                  </p>
                )}
              </div>

              {/* Kargo bilgisi */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  {displayPrice >= 1000 ? (
                    <span className="text-green-600 font-semibold">Bu ürün ücretsiz kargoya uygun!</span>
                  ) : (
                    <span className="text-gray-500">
                      <span className="font-semibold text-orange-500">₺{(1000 - displayPrice).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span> daha ekleyin, kargo bedava!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-blue-500">🚚</span>
                  <span>1-3 iş günü teslimat</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>↩️</span>
                  <span>14 gün kolay iade</span>
                </div>
              </div>

              {/* Sepete ekle */}
              <div className="flex gap-3 mt-2">
                <AddToCartButton
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={displayPrice}
                  image={product.images[0]?.url}
                 />
                <button className="w-14 h-14 rounded-2xl border-2 border-orange-200 bg-white flex items-center justify-center text-xl hover:bg-orange-50 transition-colors">
                  ❤️
                </button>
              </div>

              {/* Stok durumu */}
              <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `✓ Stokta var (${product.stock} adet)` : '✗ Stokta yok'}
              </p>
            </div>
          </div>

          {/* Açıklama */}
          {product.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h2 className="text-base font-extrabold text-gray-800 mb-3">Ürün Açıklaması</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>

        {/* Yorumlar */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-6">
          <h2 className="text-base font-extrabold text-gray-800 mb-4">
            Müşteri Yorumları {product.reviews.length > 0 && `(${product.reviews.length})`}
          </h2>
          {product.reviews.length === 0 ? (
            <p className="text-sm text-gray-400">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
          ) : (
            <div className="flex flex-col gap-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className={`text-sm ${s <= review.rating ? 'text-orange-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{review.user.name || 'Anonim'}</span>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Benzer ürünler */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-base font-extrabold text-gray-800 mb-4">Benzer Ürünler</h2>
            <ProductGrid products={similarProducts} total={similarProducts.length} page={1} totalPages={1} slug={firstCategory?.slug || ''} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true } })
  return {
    title: `${product?.name || 'Ürün'} | sePetMama`,
    description: product?.description || product?.name,
  }
}