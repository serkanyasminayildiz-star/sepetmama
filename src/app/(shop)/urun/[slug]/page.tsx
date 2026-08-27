import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Header from '@/app/(home)/components/Header'
import Footer from '@/app/(home)/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import ProductGrid from '@/app/(shop)/kategori/[slug]/ProductGrid'
import AddToCartButton from './AddToCartButton'
import JsonLd from '@/components/JsonLd'

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

  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const productUrl = `${siteUrl}/urun/${product.slug}`

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    ...(product.description ? { description: product.description } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "TRY",
      price: displayPrice.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: displayPrice >= 1000 ? "0.00" : "49.90",
          currency: "TRY",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    ...(avgRating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  }

  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteUrl}/` },
    ...(firstCategory
      ? [{
          "@type": "ListItem",
          position: 2,
          name: firstCategory.name,
          item: `${siteUrl}/kategori/${firstCategory.slug}`,
        }]
      : []),
    {
      "@type": "ListItem",
      position: firstCategory ? 3 : 2,
      name: product.name,
      item: productUrl,
    },
  ]

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
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
              <div className="relative h-[320px] md:h-[400px] bg-shell rounded-2xl overflow-hidden mb-3">
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
                    <div key={i} className="relative w-16 h-16 flex-shrink-0 bg-shell rounded-xl overflow-hidden border-2 border-orange-100">
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
                {product.shortDescription && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-2">{product.shortDescription}</p>
                )}
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
                  <span>1-3 iş günü içinde kargoda</span>
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
              {product.stock > 0 ? (
                product.stock <= 5 ? (
                  <p className="text-sm font-bold text-orange-600">⚡ Son {product.stock} adet — stoklarla sınırlı!</p>
                ) : (
                  <p className="text-sm font-semibold text-green-600">✓ Stokta var, hemen kargoya hazır</p>
                )
              ) : (
                <p className="text-sm font-semibold text-red-500">✗ Stokta yok</p>
              )}

              {/* Güven rozetleri */}
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { icon: '✅', label: '%100 Orijinal Ürün' },
                  { icon: '🔒', label: 'Güvenli Ödeme' },
                  { icon: '💳', label: 'Taksit İmkanı' },
                  { icon: '🚚', label: 'Hızlı Kargo' },
                  { icon: '↩️', label: 'Kolay İade (14 gün)' },
                ].map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700">
                    <span>{b.icon}</span>{b.label}
                  </span>
                ))}
              </div>
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
    // Marka adını layout'taki title template'i ekliyor ("%s | Leziz Mama")
    title: product?.name || 'Ürün',
    description: product?.description || product?.name,
  }
}