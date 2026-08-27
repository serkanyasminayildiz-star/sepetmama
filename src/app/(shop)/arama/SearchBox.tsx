'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBox({ initial }: { initial: string }) {
  const [q, setQ] = useState(initial)
  const router = useRouter()

  const search = () => {
    const t = q.trim()
    if (t) router.push(`/arama?q=${encodeURIComponent(t)}`)
  }

  return (
    <div className="flex items-center h-12 rounded-full bg-white border-2 border-orange-200 focus-within:border-gold overflow-hidden shadow-sm mb-5 transition-colors">
      <span className="pl-4 text-gray-400">🔍</span>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') search() }}
        placeholder="Ürün, marka ara..."
        autoFocus={!initial}
        className="flex-1 border-none outline-none px-3 text-sm bg-transparent text-gray-800 placeholder:text-gray-400"
      />
      <button
        onClick={search}
        className="bg-gold hover:bg-gold-dark text-goldink font-extrabold text-sm h-10 px-5 mr-1 rounded-full transition-colors"
      >
        Ara
      </button>
    </div>
  )
}
