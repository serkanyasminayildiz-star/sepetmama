'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const campaigns = [
  { title: '🐱 Kedi Maması -20%', sub: 'Royal Canin & Hills seçili ürünler' },
  { title: '🚚 1000₺ Üzeri Bedava', sub: 'Tüm siparişlerde ücretsiz kargo' },
]

export default function HeroBanner() {
  const [active, setActive] = useState(0)
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % campaigns.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const search = () => {
    const q = query.trim()
    if (q) router.push(`/arama?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] overflow-hidden">
      <Image
        src="/images/hero-leziz.png"
        alt="Leziz Mama — kedi ve köpek mamaları"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Marka gradienti — metnin her ekranda okunması için */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0E2A21]/85 via-[#0E2A21]/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E2A21]/70 via-transparent to-transparent" />

      {/* Marka mesajı */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="px-5 sm:px-8 md:px-12 max-w-[620px]">
          <p className="text-gold text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.16em] mb-2">
            Kedi &amp; Köpek · %100 Orijinal
          </p>
          <h1 className="font-display text-white text-[26px] sm:text-[36px] md:text-[46px] font-semibold leading-[1.08] tracking-tight text-balance">
            Sofradaki kadar <span className="italic text-gold">leziz</span>,<br className="hidden sm:block" /> dostuna layık mama.
          </h1>
          <p className="hidden sm:block text-white/80 text-sm mt-3 max-w-[420px] leading-relaxed">
            Seçkin markalar, hızlı kargo ve güvenli alışveriş. 1000₺ üzeri kargo ücretsiz.
          </p>
        </div>
      </div>

      {/* Kampanya — sağ üst */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-20">
        <div className="bg-[#0E2A21]/85 border border-gold/40 text-white rounded-xl px-3 py-2 max-w-[160px] sm:max-w-[190px] backdrop-blur-sm">
          <p className="text-[11px] font-extrabold leading-tight">{campaigns[active].title}</p>
          <p className="text-[9px] opacity-85 mt-0.5">{campaigns[active].sub}</p>
        </div>
        <div className="flex gap-1.5">
          {campaigns.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Kampanya ${i + 1}`}
              className={`h-[7px] rounded-full transition-all duration-300 ${
                i === active ? 'w-[18px] bg-gold' : 'w-[7px] bg-white/45'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Arama — hero alt kısmında */}
      <div className="absolute bottom-4 left-4 right-4 z-20 max-w-xl mx-auto">
        <div className="flex items-center h-11 rounded-full bg-white/95 border-2 border-gold overflow-hidden shadow-lg">
          <span className="pl-4 text-gray-400">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') search() }}
            placeholder="Ürün Ara..."
            className="flex-1 border-none outline-none px-3 text-sm bg-transparent text-gray-800 placeholder:text-gray-400"
          />
          <button
            onClick={search}
            aria-label="Ara"
            className="bg-gold hover:bg-gold-dark transition-colors h-9 w-9 mr-1 rounded-full flex items-center justify-center text-goldink"
          >
            🔍
          </button>
        </div>
      </div>
    </div>
  )
}
