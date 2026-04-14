import Link from 'next/link'
import Image from 'next/image'

export default function ProductGrid({ products, total, page, totalPages, slug }: {
  products: any[]
  total: number
  page: number
  totalPages: number
  slug: string
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🐾</p>
        <p className="text-gray-500 font-semibold">Bu kategoride ürün bulunamadı.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((product) => {
          const price = parseFloat(product.price)
          const salePrice = product.salePrice ? parseFloat(product.salePrice) : null
          const image = product.images[0]?.url
          const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : null

          return (
            <Link key={product.id} href={`/urun/${product.slug}`}>
              <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="relative h-[160px] bg-orange-50">
                  {image ? (
                    <Image src={image} alt={product.name} fill className="object-contain p-2" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
                  )}
                  {discount && discount > 0 && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                      %{discount}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-gray-800 font-semibold leading-tight line-clamp-2 mb-2 min-h-[32px]">
                    {product.name}
                  </p>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-base font-extrabold text-orange-500">
                      ₺{(salePrice ?? price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {salePrice && (
                      <span className="text-xs text-gray-300 line-through">
                        ₺{price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold py-2 rounded-xl transition-colors">
                    + Sepete Ekle
                  </button>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <a href={`/kategori/${slug}?sayfa=${page - 1}`} className="px-4 py-2 rounded-xl border border-orange-200 text-sm font-extrabold text-orange-500 hover:bg-orange-50">
              ← Önceki
            </a>
          )}
          <span className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-extrabold">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a href={`/kategori/${slug}?sayfa=${page + 1}`} className="px-4 py-2 rounded-xl border border-orange-200 text-sm font-extrabold text-orange-500 hover:bg-orange-50">
              Sonraki →
            </a>
          )}
        </div>
      )}
    </div>
  )
}