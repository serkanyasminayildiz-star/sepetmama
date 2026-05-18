'use client'

import { useEffect, useRef } from 'react'
import { trackPurchase, type PurchaseItem } from '@/lib/gtag'

interface Props {
  orderId: string
  value: number
  items: PurchaseItem[]
}

export default function PurchaseTracker({ orderId, value, items }: Props) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    trackPurchase({ orderId, value, items })
  }, [orderId, value, items])

  return null
}
