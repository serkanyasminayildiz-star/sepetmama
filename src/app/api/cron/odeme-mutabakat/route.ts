import { NextRequest, NextResponse } from 'next/server'
import { odemeMutabakati } from '@/lib/order/mutabakat'

/**
 * Saatlik ödeme mutabakatı (Vercel Cron).
 *
 * Callback kaçtığında sipariş PENDING'de kalıyor ve admin panelinin ana
 * listesinde görünmüyor — bu iş olmazsa ödenmiş bir sipariş tamamen gözden
 * kaçar (23 Eyl'de ₺2.499'luk sipariş böyle kaldı). Burada iyzico'ya sorulup
 * gerçekten ödenmiş olanlar otomatik onaylanır; müşteriye onay maili gider.
 *
 * Güvenlik: CRON_SECRET zorunlu (fail-closed). Vercel cron isteği bu değeri
 * Authorization başlığında gönderir; secret tanımlı değilse uç nokta kapalıdır.
 */
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron] CRON_SECRET tanımlı değil — mutabakat çalıştırılmadı')
    return NextResponse.json({ error: 'Yapılandırılmamış' }, { status: 503 })
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  // Son 7 gün yeterli: daha eskisi zaten mutabakattan geçmiştir
  const sonuc = await odemeMutabakati(true, 7)

  const duzeltilen = sonuc.ozet.odenmis ?? 0
  if (duzeltilen > 0 || (sonuc.ozet.duzeltilemedi ?? 0) > 0) {
    console.warn('[cron] mutabakat:', JSON.stringify(sonuc.ozet))
  }
  return NextResponse.json({ calisti: true, ...sonuc })
}
