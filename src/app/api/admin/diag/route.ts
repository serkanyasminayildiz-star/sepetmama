import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// GEÇİCİ teşhis ucu — admin-only. GERÇEK e-posta kod yolunu Vercel runtime'ında
// adım adım çalıştırır ve her aşamanın gerçek hatasını döndürür. Secret sızdırmaz.
// Sorun çözülünce silinecek.
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const key = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || 'SepetMama <siparis@sepetmama.com>'
  const result: Record<string, unknown> = {
    runtime: 'vercel',
    hasResendKey: !!key,
    keyPrefix: key ? key.slice(0, 6) : null,
    keyLength: key ? key.length : 0,
    emailFrom,
    adminTo: session.user.email,
  }

  // Aşama 1: email modülü yüklenebiliyor mu? (statik import init fail testi)
  try {
    await import('@/lib/email/send')
    result.moduleImportOk = true
  } catch (e) {
    result.moduleImportOk = false
    result.moduleImportError = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
  }

  // Aşama 2: react-email render() çalışıyor mu?
  let html = ''
  try {
    const { render } = await import('@react-email/components')
    const WinBackEmail = (await import('@/emails/WinBackEmail')).default
    html = await render(
      WinBackEmail({ customerName: 'Test', code: 'TEKRAR15', discountText: '%15 indirim', minOrderText: 'Min. ₺200' })
    )
    result.renderOk = true
    result.htmlLength = html.length
  } catch (e) {
    result.renderOk = false
    result.renderError = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
    return NextResponse.json(result)
  }

  // Aşama 3: Resend gerçek gönderim (admin'in kendi adresine)
  try {
    const { Resend } = await import('resend')
    if (!key) {
      result.sendOk = false
      result.sendError = 'RESEND_API_KEY runtime yok'
      return NextResponse.json(result)
    }
    const resend = new Resend(key)
    const r = await resend.emails.send({
      from: emailFrom,
      to: session.user.email!,
      subject: 'SepetMama — diag testi ✅',
      html,
    })
    result.sendOk = !r.error
    result.sendId = r.data?.id ?? null
    result.sendError = r.error ? JSON.stringify(r.error) : null
  } catch (e) {
    result.sendOk = false
    result.sendError = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
  }

  return NextResponse.json(result)
}
