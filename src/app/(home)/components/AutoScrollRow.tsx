'use client'

import { useRef, useEffect } from 'react'
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

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let animId: number
    let paused = false
    const scroll = () => {
      if (!paused && el) {
        el.scrollLeft += 0.4
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0
      }
      animId = requestAnimationFrame(scroll)
    }
    animId = requestAnimationFrame(scroll)
    const pause = () => { paused = true }
    const resume = () => { paused = false }
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)
    el.addEventListener('touchstart', pause, { passive: true })
    el.addEventListener('touchend', resume, { passive: true })
    return () => {
      cancelAnimationFrame(animId)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('touchend', resume)
    }
  }, [])

  const cards = products.map((p) => (
    <HomeProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} price={p.price} salePrice={p.salePrice} image={p.image} />
  ))

  return (
    <div ref={ref} style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' as any }}>
      {cards}
      {cards}
    </div>
  )
}
