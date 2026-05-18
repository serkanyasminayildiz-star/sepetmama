import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!
const PAYTR_TEST_MODE = process.env.PAYTR_TEST_MODE === '1' ? '1' : '0'
const PAYTR_DEBUG_ON = PAYTR_TEST_MODE

const FREE_SHIPPING_THRESHOLD = 1000
const SHIPPING_FEE = 49.9

interface CartItemInput {
  id: string
  quantity: number
}

interface ShippingInput {
  name: string
  email: string
  phone: string
  address: string
}

interface ConsentsInput {
  kvkk: boolean
  mesafeli: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items: CartItemInput[] = body.items
    const shipping: ShippingInput = body.shipping
    const consents: ConsentsInput = body.consents

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş.' }, { status: 400 })
    }
    if (!shipping?.name || !shipping?.email || !shipping?.phone || !shipping?.address) {
      return NextResponse.json({ error: 'Tüm teslimat bilgileri zorunludur.' }, { status: 400 })
    }
    if (!consents?.kvkk || !consents?.mesafeli) {
      return NextResponse.json(
        { error: 'KVKK ve Mesafeli Satış Sözleşmesi onayı zorunludur.' },
        { status: 400 }
      )
    }

    const session = await auth()
    const userId = session?.user?.id ?? null

    const itemIds = items.map((i) => i.id)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: itemIds }, isActive: true },
    })

    if (dbProducts.length !== itemIds.length) {
      return NextResponse.json(
        { error: 'Sepetteki bazı ürünler artık mevcut değil.' },
        { status: 400 }
      )
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))
    let cartTotal = 0
    const orderItemsData: { productId: string; quantity: number; price: number }[] = []
    const basketLines: [string, string, number][] = []

    for (const item of items) {
      const product = productMap.get(item.id)
      if (!product) {
        return NextResponse.json({ error: `Ürün bulunamadı: ${item.id}` }, { status: 400 })
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json({ error: 'Geçersiz miktar.' }, { status: 400 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stok yetersiz: ${product.name} (kalan: ${product.stock})` },
          { status: 400 }
        )
      }
      const effectivePrice = product.salePrice
        ? parseFloat(product.salePrice.toString())
        : parseFloat(product.price.toString())
      cartTotal += effectivePrice * item.quantity
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: effectivePrice,
      })
      basketLines.push([product.name.substring(0, 100), effectivePrice.toFixed(2), item.quantity])
    }

    const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    const grandTotal = Math.round((cartTotal + shippingFee) * 100) / 100

    const userIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    const order = await prisma.order.create({
      data: {
        userId,
        shippingFullName: shipping.name,
        shippingEmail: shipping.email,
        shippingPhone: shipping.phone,
        shippingAddress: shipping.address,
        total: grandTotal,
        shippingFee,
        consents: {
          kvkk: consents.kvkk,
          mesafeli: consents.mesafeli,
          acceptedAt: new Date().toISOString(),
          ip: userIp,
          userAgent,
        },
        items: { create: orderItemsData },
      },
    })

    const merchant_oid = order.id
    const payment_amount = Math.round(grandTotal * 100).toString()
    const currency = 'TL'
    const no_installment = '0'
    const max_installment = '0'
    const lang = 'tr'

    const user_basket = Buffer.from(JSON.stringify(basketLines)).toString('base64')

    const hash_str =
      MERCHANT_ID +
      userIp +
      merchant_oid +
      shipping.email +
      payment_amount +
      user_basket +
      no_installment +
      max_installment +
      currency +
      PAYTR_TEST_MODE +
      MERCHANT_SALT

    const paytr_token = crypto.createHmac('sha256', MERCHANT_KEY).update(hash_str).digest('base64')

    const baseUrl = process.env.NEXTAUTH_URL || ''
    const merchant_ok_url = `${baseUrl}/odeme/basarili?orderId=${order.id}`
    const merchant_fail_url = `${baseUrl}/odeme/basarisiz?orderId=${order.id}`

    const params = new URLSearchParams({
      merchant_id: MERCHANT_ID,
      user_ip: userIp,
      merchant_oid,
      email: shipping.email,
      payment_amount,
      paytr_token,
      user_basket,
      debug_on: PAYTR_DEBUG_ON,
      no_installment,
      max_installment,
      user_name: shipping.name,
      user_address: shipping.address,
      user_phone: shipping.phone,
      merchant_ok_url,
      merchant_fail_url,
      timeout_limit: '30',
      currency,
      test_mode: PAYTR_TEST_MODE,
      lang,
    })

    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      body: params,
    })

    const data = await response.json()

    if (data.status === 'success') {
      return NextResponse.json({ token: data.token, orderId: order.id })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED', failedReason: data.reason || 'PayTR token error' },
    })

    return NextResponse.json({ error: data.reason || 'Ödeme başlatılamadı.' }, { status: 400 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Beklenmedik hata'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
