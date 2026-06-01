'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackPurchase, type PurchaseItem } from '@/lib/gtag'

interface Props {
  orderId: string
}

/**
 * PayTR redirect-vs-callback yarışı:
 *   Bazen kullanıcı /odeme/basarili'ye iniyor ama PayTR'ın server-to-server
 *   callback'i henüz orderı CONFIRMED yapmadıysa, status PENDING kalıyor.
 *   Eski mantıkta PurchaseTracker fire etmiyordu → Google Ads conversion
 *   sonsuza kadar kaybediyordu.
 *
 * Bu component:
 *   - Sayfa PENDING durumda yüklendiyse, /api/order-status'e 2 sn'de bir bakar
 *   - CONFIRMED görünce conversion'ı fire eder + router.refresh ile sunucu
 *     sayfasını tetikler (kullanıcı 🎉 ekranını görür)
 *   - 60 deneme (2 dk) sonra vazgeçer
 */
export default function PendingPoller({ orderId }: Props) {
  const firedRef = useRef(false)
  const [fired, setFired] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (firedRef.current) return
    let cancelled = false
    let tries = 0
    const maxTries = 60

    const tick = async () => {
      if (cancelled || firedRef.current) return
      tries++
      try {
        const res = await fetch(`/api/order-status?orderId=${orderId}`, { cache: 'no-store' })
        if (!res.ok) {
          if (tries < maxTries && !cancelled) setTimeout(tick, 2000)
          return
        }
        const data: {
          status: string
          value: number
          items: PurchaseItem[]
        } = await res.json()

        if (data.status === 'CONFIRMED' && !firedRef.current) {
          firedRef.current = true
          trackPurchase({ orderId, value: data.value, items: data.items })
          setFired(true)
          router.refresh()
          return
        }

        if (data.status === 'PENDING' && tries < maxTries && !cancelled) {
          setTimeout(tick, 2000)
        }
        // FAILED / CANCELLED / başka bir status → poll'u bırak
      } catch {
        if (tries < maxTries && !cancelled) setTimeout(tick, 2000)
      }
    }

    setTimeout(tick, 2000) // ilk 2 sn callback'e şans ver
    return () => {
      cancelled = true
    }
  }, [orderId, router])

  // Görünmez, sadece side-effect için var
  return fired ? null : null
}
