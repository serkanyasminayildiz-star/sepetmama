'use client'

import { useCartStore } from '@/store/cartStore'

interface Props {
  id: string
  slug: string
  name: string
  price: number
  image?: string
}

export default function AddToCartButton({ id, slug, name, price, image }: Props) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = () => {
    addItem({ id, slug, name, price, image })
  }

  return (
    <button
      onClick={handleAdd}
      className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white font-extrabold py-3.5 rounded-2xl text-base"
    >
      🛒 Sepete Ekle
    </button>
  )
}
