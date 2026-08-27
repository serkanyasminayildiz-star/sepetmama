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
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const search = () => {
    const q = query.trim()
    if (q) router.push(`/arama?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="relative w-full h-[530px] sm:h-[480px] md:h-[560px] overflow-hidden">
      {/* Mobil: hayvanlara odaklı dikey kırpım — Masaüstü: geniş sahne */}
      <Image
        src="/images/hero-lm-mobil.webp"
        alt="Leziz Mama — kedi ve köpek mamaları"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center sm:hidden"
      />
      <Image
        src="/images/hero-lm.webp"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center hidden sm:block"
      />

      {/* Krem gradient: görselin sıcaklığını bozmadan metni okunur kılar
          (mobilde yukarıdan, masaüstünde soldan) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F7F1E6]/95 from-8% via-[#F7F1E6]/50 via-38% to-transparent to-56% sm:bg-gradient-to-r sm:from-[#F7F1E6]/92 sm:from-12% sm:via-[#F7F1E6]/45 sm:via-42% sm:to-transparent sm:to-62%" />

      {/* Marka mesajı */}
      <div className="absolute inset-0 z-10 flex items-start sm:items-center pt-8 sm:pt-0">
        <div className="px-5 sm:px-8 md:px-14 max-w-[380px] sm:max-w-[560px] md:max-w-[660px]">
          <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange-600 mb-2.5">
            Kedi &amp; Köpek · %100 Orijinal
          </p>
          <h1 className="font-display text-[29px] sm:text-[38px] md:text-[48px] font-semibold leading-[1.08] tracking-tight text-[#16241D]">
            Sofradaki kadar <span className="italic text-[#B3442E]">leziz</span>,<br className="hidden sm:block" /> dostuna layık mama.
          </h1>
          <p className="text-[#3D4F45] text-[13px] sm:text-[15px] mt-3 max-w-[400px] leading-relaxed">
            Seçkin markalar, hızlı kargo ve güvenli alışveriş. 1000₺ üzeri kargo ücretsiz.
          </p>

          {/* Arama */}
          <div className="mt-5 flex items-center h-12 rounded-full bg-white/95 border-2 border-orange-500/25 focus-within:border-orange-500 overflow-hidden shadow-[0_10px_30px_-14px_rgba(18,63,51,0.5)] max-w-[420px] transition-colors">
            <span className="pl-4 text-gray-400">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') search() }}
              placeholder="Ürün, marka ara..."
              className="flex-1 border-none outline-none px-3 text-sm bg-transparent text-gray-800 placeholder:text-gray-400"
            />
            <button
              onClick={search}
              aria-label="Ara"
              className="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-extrabold text-sm h-10 px-5 mr-1 rounded-full"
            >
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Kampanya — sağ alt (görseldeki hayvanları kapatmaz) */}
      <div className="absolute bottom-4 right-3 sm:right-5 flex flex-col items-end gap-2 z-20">
        <div className="bg-white/90 backdrop-blur-sm border border-orange-500/20 rounded-xl px-3 py-2 max-w-[170px] sm:max-w-[200px] shadow-sm">
          <p className="text-[11px] font-extrabold leading-tight text-[#16241D]">{campaigns[active].title}</p>
          <p className="text-[9px] text-gray-500 mt-0.5">{campaigns[active].sub}</p>
        </div>
        <div className="flex gap-1.5">
          {campaigns.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Kampanya ${i + 1}`}
              className={`h-[7px] rounded-full transition-all duration-300 ${
                i === active ? 'w-[18px] bg-orange-500' : 'w-[7px] bg-white/70 border border-orange-500/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
