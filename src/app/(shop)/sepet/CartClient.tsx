'use client'

import { useCartStore } from '@/store/cartStore'
import { useCoupon } from '@/hooks/useCoupon'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const FREE_SHIPPING_THRESHOLD = 1000
const SHIPPING_FEE = 49.90

export default function CartClient() {
  const { items, removeItem, updateQty } = useCartStore()
  const total = useCartStore((s) => s.total())
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total)
  const progressPercent = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)

  const { couponCode, discount, error: couponError, loading: couponLoading, apply: applyCoupon, remove: removeCoupon } = useCoupon(total)
  const [couponInput, setCouponInput] = useState('')
  const shipping = remaining === 0 ? 0 : SHIPPING_FEE
  const grandTotal = Math.max(0, total - discount + shipping)

  const handleApplyCoupon = async () => {
    const ok = await applyCoupon(couponInput)
    if (ok) setCouponInput('')
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🛒</p>
        <p className="text-xl font-extrabold text-gray-700 mb-2">Sepetiniz boş</p>
        <p className="text-gray-400 mb-6">Hemen alışverişe başlayın!</p>
        <Link href="/" className="bg-orange-500 text-white font-extrabold px-6 py-3 rounded-2xl hover:bg-orange-600 transition-colors">
          Alışverişe Başla
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-3">

        <div className="bg-white rounded-2xl border border-orange-100 p-4">
          {remaining > 0 ? (
            <p className="text-sm font-semibold text-gray-700 mb-2">
              🚚 <span className="text-orange-500 font-extrabold">₺{remaining.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span> daha ekleyin, kargo bedava olsun!
            </p>
          ) : (
            <p className="text-sm font-extrabold text-green-600">🎉 Siparişiniz ücretsiz kargoya uygun!</p>
          )}
          <div className="mt-2 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>₺0</span>
            <span>₺{FREE_SHIPPING_THRESHOLD.toLocaleString('tr-TR')}</span>
          </div>
        </div>

        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-orange-100 p-4 flex gap-4 items-center">
            <div className="relative w-20 h-20 flex-shrink-0 bg-shell rounded-xl overflow-hidden">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-1" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/urun/${item.slug}`}>
                <p className="text-sm font-bold text-gray-800 line-clamp-2 hover:text-orange-500 transition-colors">{item.name}</p>
              </Link>
              <p className="text-base font-extrabold text-orange-500 mt-1">
                ₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">Birim: ₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 text-lg transition-colors">✕</button>
              <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-2 py-1">
                <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center font-extrabold text-orange-500 hover:bg-orange-100 rounded-lg">−</button>
                <span className="text-sm font-extrabold text-gray-700 min-w-[20px] text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center font-extrabold text-orange-500 hover:bg-orange-100 rounded-lg">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-orange-100 p-5 sticky top-20">
          <h2 className="font-extrabold text-gray-800 mb-4 text-base">Sipariş Özeti</h2>

          {/* Kupon */}
          <div className="mb-4">
            {discount > 0 ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <span className="text-sm font-semibold text-green-700">
                  🎉 <span className="font-extrabold">{couponCode}</span> uygulandı
                </span>
                <button onClick={removeCoupon} className="text-xs text-green-700 font-semibold hover:underline">
                  Kaldır
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon() }}
                    placeholder="İndirim kodu"
                    className="flex-1 border-[1.5px] border-gray-300 rounded-xl px-3 py-2.5 text-sm text-black outline-none uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="bg-gray-800 hover:bg-gray-900 disabled:opacity-40 text-white font-bold px-4 rounded-xl text-sm whitespace-nowrap transition-colors"
                  >
                    {couponLoading ? '...' : 'Uygula'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {couponError}
                    {couponError.includes('üye') && (
                      <>
                        {' '}
                        <Link href="/giris" className="text-orange-500 font-semibold underline">Giriş yap</Link>
                        {' / '}
                        <Link href="/kayit" className="text-orange-500 font-semibold underline">Üye ol</Link>
                      </>
                    )}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ara Toplam</span>
              <span className="font-semibold">₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-semibold">
                  {`İndirim (${couponCode})`}
                </span>
                <span className="text-green-600 font-semibold">-₺{discount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Kargo</span>
              <span className={`font-semibold ${remaining === 0 ? 'text-green-600' : ''}`}>
                {remaining === 0 ? 'Ücretsiz' : '₺49,90'}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-extrabold text-gray-800">Toplam</span>
              <span className="font-extrabold text-orange-500 text-lg">
                ₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <Link href="/odeme" className="block w-full bg-gold hover:bg-gold-dark active:scale-95 transition-all text-goldink font-extrabold py-3.5 rounded-2xl text-center text-base">
            Siparişi Tamamla →
          </Link>
          <Link href="/" className="block w-full text-center text-sm text-orange-500 font-semibold mt-3 hover:underline">
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  )
}
