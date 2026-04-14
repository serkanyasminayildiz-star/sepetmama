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
    <div className="w-[222px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
      <Link href={`/urun/${slug}`} className="flex flex-col flex-1">
        <div className="relative w-full h-[180px] bg-orange-50 flex-shrink-0">
          {image ? (
            <Image src={image} alt={name} fill sizes="222px" className="object-contain p-3" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
          )}
          {discount && discount > 0 && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">%{discount}</span>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <p className="text-[12px] font-semibold text-gray-700 line-clamp-2 mb-auto min-h-[36px]">{name}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-base font-extrabold text-orange-500">₺{displayPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            {salePrice && <span className="text-[10px] text-gray-300 line-through">₺{price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>}
          </div>
        </div>
      </Link>
      <button
        onClick={() => addItem({ id, slug, name, price: displayPrice, image })}
        className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-extrabold py-2.5 transition-all flex-shrink-0"
      >
        + Sepete Ekle
      </button>
    </div>
  )
}
