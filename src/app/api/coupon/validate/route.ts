import { NextRequest, NextResponse } from 'next/server'
import { validateAndComputeCoupon } from '@/lib/coupon'
import { auth } from '@/auth'

// Public — checkout'ta kupon önizlemesi için. Gerçek indirim PayTR token
// route'unda sunucu fiyatlarıyla yeniden hesaplanır.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const code = typeof body.code === 'string' ? body.code : ''
    const cartTotal = typeof body.cartTotal === 'number' ? body.cartTotal : 0

    const session = await auth()
    const result = await validateAndComputeCoupon(code, cartTotal, session?.user?.id ?? null)
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ code: result.code, discount: result.discount })
  } catch {
    return NextResponse.json({ error: 'Kupon doğrulanamadı.' }, { status: 500 })
  }
}
