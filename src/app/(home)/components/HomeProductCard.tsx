'use client'

import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  id: string
  slug: string
  name: string
  price: number
  salePrice?: number
  image?: string
}

export default function HomeProductCard({ id, slug, name, price, salePrice, image }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const displayPrice = salePrice ?? price
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : null

  return (
    <div className="min-w-[130px] max-w-[130px] md:min-w-0 md:max-w-none bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all flex-shrink-0">
      <Link href={`/urun/${slug}`}>
        <div className="relative h-[100px] md:h-[120px] bg-orange-50">
          {image ? (
            <Image src={image} alt={name} fill sizes="150px" className="object-contain p-2" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
          )}
          {discount && discount > 0 && (
            <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">%{discount}</span>
          )}
        </div>
        <div className="p-2">
          <p className="text-[10px] font-semibold text-gray-700 line-clamp-2 mb-1 min-h-[28px]">{name}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-orange-500">₺{displayPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            {salePrice && <span className="text-[9px] text-gray-300 line-through">₺{price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>}
          </div>
        </div>
      </Link>
      <button
        onClick={() => addItem({ id, slug, name, price: displayPrice, image })}
        className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[10px] font-extrabold py-1.5 transition-all"
      >
        + Sepete Ekle
      </button>
    </div>
  )
}
