'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useCartStore } from '@/store/cartStore'

/**
 * Kupon durumunu sepet + ödeme sayfaları arasında paylaşılan tek kaynaktan
 * (cartStore.couponCode, localStorage'a persist) yönetir.
 *
 * - cartTotal değiştikçe indirimi yeniden hesaplar (sunucu /api/coupon/validate)
 * - apply(code): doğrula, geçerliyse store'a yaz
 * - remove(): kuponu kaldır
 *
 * Gerçek tahsilat her zaman PayTR token route'unda sunucu fiyatlarıyla
 * yeniden doğrulanır; bu hook yalnızca UI önizlemesi içindir.
 */
export function useCoupon(cartTotal: number) {
  const couponCode = useCartStore((s) => s.couponCode)
  const setCoupon = useCartStore((s) => s.setCoupon)

  const [discount, setDiscount] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const reqId = useRef(0)

  // Kod veya sepet tutarı değiştikçe indirimi tazele
  useEffect(() => {
    if (!couponCode) {
      setDiscount(0)
      setError('')
      return
    }
    const myReq = ++reqId.current
    setLoading(true)
    fetch('/api/coupon/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode, cartTotal }),
    })
      .then(async (res) => ({ ok: res.ok, data: await res.json() }))
      .then(({ ok, data }) => {
        if (myReq !== reqId.current) return // eski istek — yoksay
        if (ok && data.discount != null) {
          setDiscount(data.discount)
          setError('')
        } else {
          setDiscount(0)
          setError(data.error || 'Kupon geçersiz.')
        }
      })
      .catch(() => {
        if (myReq !== reqId.current) return
        setDiscount(0)
        setError('Kupon doğrulanamadı.')
      })
      .finally(() => {
        if (myReq === reqId.current) setLoading(false)
      })
  }, [couponCode, cartTotal])

  const apply = useCallback(
    async (rawCode: string): Promise<boolean> => {
      const code = rawCode.trim().toUpperCase()
      if (!code) return false
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/coupon/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, cartTotal }),
        })
        const data = await res.json()
        if (res.ok && data.discount != null) {
          setDiscount(data.discount)
          setError('')
          setCoupon(code) // persist — effect tekrar doğrular ama sorun değil
          return true
        }
        setError(data.error || 'Kupon uygulanamadı.')
        return false
      } catch {
        setError('Kupon doğrulanamadı.')
        return false
      } finally {
        setLoading(false)
      }
    },
    [cartTotal, setCoupon]
  )

  const remove = useCallback(() => {
    setCoupon(null)
    setDiscount(0)
    setError('')
  }, [setCoupon])

  return { couponCode, discount, error, loading, apply, remove }
}
