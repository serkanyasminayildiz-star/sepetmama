'use client'

import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'

export default function CartIcon() {
  const count = useCartStore((s) => s.count())

  return (
    <Link href="/sepet" className="relative w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center text-base hover:bg-orange-50 transition-colors">
      🛒
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
