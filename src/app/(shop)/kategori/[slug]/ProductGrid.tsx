'use client'

import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProductGrid({ products, total, page, totalPages, slug }: any) {
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {products.map((product: any) => {
          const price = parseFloat(product.price)
          const salePrice = product.salePrice ? parseFloat(product.salePrice) : null
          const displayPrice = salePrice ?? price
          const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : null
          const image = product.images[0]?.url

          return (
            <div key={product.id} className="bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-md transition-all flex flex-col">
              <Link href={`/urun/${product.slug}`} className="flex-1 flex flex-col">
                <div className="relative h-[120px] md:h-[150px] bg-orange-50">
                  {image ? (
                    <Image src={image} alt={product.name} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-contain p-2" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                  )}
                  {discount && discount > 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">%{discount}</span>
                  )}
                </div>
                <div className="p-2 flex flex-col flex-1">
                  <p className="text-[11px] md:text-xs font-semibold text-gray-700 line-clamp-2 mb-auto min-h-[30px]">{product.name}</p>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-sm font-extrabold text-orange-500">₺{displayPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {salePrice && <span className="text-[9px] text-gray-300 line-through">₺{price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => addItem({ id: product.id, slug: product.slug, name: product.name, price: displayPrice, image })}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[10px] md:text-xs font-extrabold py-2 transition-all"
              >
                + Sepete Ekle
              </button>
            </div>
          )
        })}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <button onClick={() => router.push(`/kategori/${slug}?sayfa=${page - 1}`)} className="bg-white border-2 border-orange-200 text-orange-500 font-extrabold text-sm px-4 py-2 rounded-xl hover:bg-orange-50">← Önceki</button>
          )}
          <span className="bg-orange-500 text-white font-extrabold text-sm px-4 py-2 rounded-xl">{page} / {totalPages}</span>
          {page < totalPages && (
            <button onClick={() => router.push(`/kategori/${slug}?sayfa=${page + 1}`)} className="bg-white border-2 border-orange-200 text-orange-500 font-extrabold text-sm px-4 py-2 rounded-xl hover:bg-orange-50">Sonraki →</button>
          )}
        </div>
      )}
    </div>
  )
}
