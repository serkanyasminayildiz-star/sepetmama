'use client'

import { useRef, useEffect } from 'react'

export default function AutoScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let animId: number
    let paused = false

    const scroll = () => {
      if (!paused && el) {
        el.scrollLeft += 0.5
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0
        }
      }
      animId = requestAnimationFrame(scroll)
    }

    animId = requestAnimationFrame(scroll)

    el.addEventListener('mouseenter', () => { paused = true })
    el.addEventListener('mouseleave', () => { paused = false })
    el.addEventListener('touchstart', () => { paused = true })
    el.addEventListener('touchend', () => { paused = false })

    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div ref={ref} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {children}
      {children}
    </div>
  )
}