import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// GEÇİCİ teşhis ucu — admin-only. Deploy'ın runtime'da hangi env değerlerini
// gördüğünü secret sızdırmadan raporlar (sadece key ön eki + uzunluğu).
// Sorun çözülünce silinecek.
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const key = process.env.RESEND_API_KEY
  return NextResponse.json({
    hasResendKey: !!key,
    keyPrefix: key ? key.slice(0, 6) : null,
    keyLength: key ? key.length : 0,
    emailFrom: process.env.EMAIL_FROM || '(fallback) SepetMama <siparis@sepetmama.com>',
    adminEmail: process.env.ADMIN_EMAIL || '(fallback) info@sepetmama.com',
    nextauthUrl: process.env.NEXTAUTH_URL || null,
  })
}
