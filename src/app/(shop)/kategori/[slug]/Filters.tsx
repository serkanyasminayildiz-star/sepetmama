'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  searchParams: any
  brands: string[]
  mobile?: boolean
}

export default function Filters({ searchParams, brands, mobile }: Props) {
  const router = useRouter()
  const [min, setMin] = useState(searchParams.min || '')
  const [max, setMax] = useState(searchParams.max || '')
  const [acik, setAcik] = useState(false)

  const apply = (newParams: Record<string, string>) => {
    const params = new URLSearchParams()
    if (min) params.set('min', min)
    if (max) params.set('max', max)
    Object.entries(newParams).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k))
    router.push(`?${params.toString()}`)
  }

  const temizle = () => {
    setMin('')
    setMax('')
    router.push('?')
  }

  const filterContent = (
    <div className="space-y-4">
      {/* Fiyat */}
      <div>
        <p className="text-xs font-extrabold text-gray-500 uppercase mb-2">Fiyat Aralığı</p>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Min ₺"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full border border-orange-100 rounded-xl px-2 py-2 text-sm outline-none focus:border-orange-400"
            style={{ color: '#000' }}
          />
          <input
            type="number"
            placeholder="Max ₺"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full border border-orange-100 rounded-xl px-2 py-2 text-sm outline-none focus:border-orange-400"
            style={{ color: '#000' }}
          />
        </div>
        <button
          onClick={() => apply({})}
          className="w-full bg-orange-500 text-white text-xs font-extrabold py-2 rounded-xl hover:bg-orange-600 transition-colors"
        >
          Uygula
        </button>
      </div>

      {/* Marka */}
      {brands.length > 0 && (
        <div>
          <p className="text-xs font-extrabold text-gray-500 uppercase mb-2">Marka</p>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={searchParams.marka === brand}
                  onChange={(e) => apply({ marka: e.target.checked ? brand : '' })}
                  className="accent-orange-500"
                />
                <span className="text-xs text-gray-600 group-hover:text-orange-500 transition-colors">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Temizle */}
      {(searchParams.min || searchParams.max || searchParams.marka) && (
        <button
          onClick={temizle}
          className="w-full border border-orange-200 text-orange-500 text-xs font-extrabold py-2 rounded-xl hover:bg-orange-50 transition-colors"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  )

  if (mobile) {
    return (
      <div>
        <button
          onClick={() => setAcik(!acik)}
          className="flex items-center gap-2 bg-white border-2 border-orange-200 text-orange-500 font-extrabold text-sm px-4 py-2 rounded-xl"
        >
          🔧 Filtrele
          {(searchParams.min || searchParams.max || searchParams.marka) && (
            <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>
          )}
          <span>{acik ? '▲' : '▼'}</span>
        </button>
        {acik && (
          <div className="mt-2 bg-white rounded-2xl border border-orange-100 p-4">
            {filterContent}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-4">
      <h3 className="font-extrabold text-gray-800 text-sm mb-4">Filtreler</h3>
      {filterContent}
    </div>
  )
}
