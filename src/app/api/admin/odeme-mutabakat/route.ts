import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { odemeMutabakati } from '@/lib/order/mutabakat'

/**
 * Ödeme mutabakatı — elle çalıştırma (admin).
 * Mantık lib/order/mutabakat.ts'te; cron da aynı fonksiyonu kullanır.
 *
 * Varsayılan: yalnızca RAPOR. `?uygula=1` ile ödendiği doğrulananlar onaylanır.
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const uygula = req.nextUrl.searchParams.get('uygula') === '1'
  const gunSayisi = Number(req.nextUrl.searchParams.get('gun') || '30')

  const sonuc = await odemeMutabakati(uygula, gunSayisi)
  return NextResponse.json({ mod: uygula ? 'UYGULA' : 'SADECE_RAPOR', ...sonuc })
}
