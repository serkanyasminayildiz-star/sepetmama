import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  return new NextResponse('OK')
}

export async function POST(req: NextRequest) {
  const body = await req.formData()
  const merchantOid = body.get('merchant_oid') as string
  const status = body.get('status') as string
  const totalAmount = body.get('total_amount') as string
  const hash = body.get('hash') as string
  const merchantKey = process.env.PAYTR_MERCHANT_KEY!
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT!
  const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`
  const expectedHash = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr)
    .digest('base64')
  if (hash !== expectedHash) {
    return new NextResponse('PAYTR notification failed: bad hash', { status: 400 })
  }
  if (status === 'success') {
    console.log(`Ödeme başarılı: ${merchantOid}`)
  } else {
    console.log(`Ödeme başarısız: ${merchantOid}`)
  }
  return new NextResponse('OK')
}
