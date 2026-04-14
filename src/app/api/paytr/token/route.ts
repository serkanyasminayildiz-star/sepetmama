import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, total, userIp, email, name, phone, address } = body

    const merchant_oid = 'SM' + Date.now()
    const user_ip = userIp || req.headers.get('x-forwarded-for') || '127.0.0.1'
    const payment_amount = Math.round(total * 100).toString()
    const currency = 'TL'
    const no_installment = '0'
    const max_installment = '0'
    const lang = 'tr'
    const debug_on = '1'
    const test_mode = '1'
    const timeout_limit = '30'
    const merchant_ok_url = `${process.env.NEXTAUTH_URL}/odeme/basarili`
    const merchant_fail_url = `${process.env.NEXTAUTH_URL}/odeme/basarisiz`

    const basket = items.map((item: { name: string; price: number; quantity: number }) => [
      item.name.substring(0, 100),
      item.price.toFixed(2),
      item.quantity,
    ])
    const user_basket = Buffer.from(JSON.stringify(basket)).toString('base64')

    const hash_str = MERCHANT_ID + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + MERCHANT_SALT
    const paytr_token = crypto.createHmac('sha256', MERCHANT_KEY).update(hash_str).digest('base64')

    const params = new URLSearchParams({
      merchant_id: MERCHANT_ID,
      user_ip,
      merchant_oid,
      email,
      payment_amount,
      paytr_token,
      user_basket,
      debug_on,
      no_installment,
      max_installment,
      user_name: name,
      user_address: address,
      user_phone: phone,
      merchant_ok_url,
      merchant_fail_url,
      timeout_limit,
      currency,
      test_mode,
      lang,
    })

    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      body: params,
    })

    const data = await response.json()

    if (data.status === 'success') {
      return NextResponse.json({ token: data.token, orderId: merchant_oid })
    } else {
      return NextResponse.json({ error: data.reason }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
