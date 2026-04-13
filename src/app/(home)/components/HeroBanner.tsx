'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const campaigns = [
  { title: '🎉 İlk Siparişe %10', sub: 'SEPETMAMA10 kodunu kullan' },
  { title: '🐱 Kedi Maması -20%', sub: 'Royal Canin & Hills seçili ürünler' },
  { title: '🚚 150₺ Üzeri Bedava', sub: 'Tüm siparişlerde ücretsiz kargo' },
]

export default function HeroBanner() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % campaigns.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-[280px] sm:h-[360px] md:h-[440px]">
      <Image
        src="/images/hero.png"
        alt="sePetMama Hero"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

      {/* Kampanya — sağ üst */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
        <div className="bg-blue-700/85 text-white rounded-xl px-3 py-2 max-w-[160px] sm:max-w-[190px]">
          <p className="text-[11px] font-extrabold leading-tight">{campaigns[active].title}</p>
          <p className="text-[9px] opacity-85 mt-0.5">{campaigns[active].sub}</p>
        </div>
        <div className="flex gap-1.5">
          {campaigns.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-[7px] rounded-full transition-all duration-300 ${
                i === active ? 'w-[18px] bg-orange-500' : 'w-[7px] bg-white/45'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Arama — hero alt kısmında */}
      <div className="absolute bottom-4 left-4 right-4 z-10 max-w-xl mx-auto">
        <div className="flex items-center h-11 rounded-full bg-white/95 border-2 border-orange-500 overflow-hidden shadow-lg">
          <span className="pl-4 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Ürün Ara..."
            className="flex-1 border-none outline-none px-3 text-sm bg-transparent text-gray-800 placeholder:text-gray-400"
          />
          <button className="bg-orange-500 hover:bg-orange-600 transition-colors h-9 w-9 mr-1 rounded-full flex items-center justify-center text-white">
            🔍
          </button>
        </div>
      </div>
    </div>
  )
}