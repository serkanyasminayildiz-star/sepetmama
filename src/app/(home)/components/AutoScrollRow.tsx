'use client'

import { useRef, useEffect, useState } from 'react'
import HomeProductCard from './HomeProductCard'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  salePrice?: number
  image?: string
}

export default function AutoScrollRow({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let animId: number
    let lastTime = 0

    const scroll = (time: number) => {
      if (!paused) {
        if (time - lastTime > 16) {
          el.scrollLeft += 0.6
          if (el.scrollLeft >= el.scrollWidth / 2) {
            el.scrollLeft = 0
          }
          lastTime = time
        }
      }
      animId = requestAnimationFrame(scroll)
    }

    animId = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(animId)
  }, [paused])

  const cards = products.map((p) => (
    <div key={p.id} className="flex-shrink-0">
      <HomeProductCard
        id={p.id}
        slug={p.slug}
        name={p.name}
        price={p.price}
        salePrice={p.salePrice}
        image={p.image}
      />
    </div>
  ))

  return (
    <div
      ref={ref}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 2000)}
      style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '8px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        cursor: 'grab',
      }}
    >
      {cards}
      {cards}
    </div>
  )
}
