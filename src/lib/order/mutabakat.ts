import { prisma } from '@/lib/prisma'
import { retrievePaymentByOrderId, describeNetworkError } from '@/lib/iyzico'
import { sendOrderConfirmation, sendAdminNotification } from '@/lib/email/send'

/**
 * Ödeme mutabakatı — TEK KAYNAK (admin endpoint'i ve cron aynı mantığı kullanır).
 *
 * Neden gerekli: callback (iyzico → bize dönüş) kaçabilir — ağ kopması,
 * kullanıcının sayfayı kapatması, fonksiyon soğuk başlangıcı. O durumda para
 * çekilmiş olmasına rağmen sipariş PENDING'de kalır. Admin panelinde PENDING
 * siparişler ana listede gösterilmediği için bu mutabakat olmazsa böyle bir
 * sipariş tamamen gözden kaçar.
 *
 * `uygula=false` → yalnızca rapor, hiçbir şey değişmez.
 */
export interface MutabakatSonuc {
  incelenen: number
  ozet: Record<string, number>
  rapor: Record<string, unknown>[]
}

export async function odemeMutabakati(
  uygula: boolean,
  gunSayisi = 30
): Promise<MutabakatSonuc> {

  const pendings = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      paymentMethod: 'ONLINE',
      createdAt: { gte: new Date(Date.now() - gunSayisi * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: { select: { name: true } } } } },
  })

  const rapor: Record<string, unknown>[] = []

  for (const order of pendings) {
    const satir: Record<string, unknown> = {
      siparis: order.id.slice(-8).toUpperCase(),
      id: order.id,
      tarih: order.createdAt.toISOString(),
      musteri: order.shippingFullName,
      tutar: Number(order.total),
    }

    let sonuc
    try {
      sonuc = await retrievePaymentByOrderId(order.id)
    } catch (err) {
      satir.durum = 'SORGULANAMADI'
      satir.hata = describeNetworkError(err)
      rapor.push(satir)
      continue
    }

    satir.iyzicoStatus = sonuc.status
    satir.paymentStatus = sonuc.paymentStatus ?? null
    satir.iyzicoTutar = sonuc.paidPrice ?? null
    if (sonuc.errorCode) satir.iyzicoHata = `${sonuc.errorCode}: ${sonuc.errorMessage ?? ''}`

    const odenmis = sonuc.status === 'success' && sonuc.paymentStatus === 'SUCCESS'
    if (!odenmis) {
      // iyzico'da başarılı ödeme yok → müşteri gerçekten tamamlamamış
      satir.durum = 'ODENMEMIS'
      rapor.push(satir)
      continue
    }

    // Tutar kontrolü — eşleşmiyorsa asla otomatik onaylama
    const odenen = parseFloat(sonuc.paidPrice || '0')
    const beklenen = parseFloat(order.total.toString())
    if (Math.abs(odenen - beklenen) > 0.01) {
      satir.durum = 'TUTAR_UYUSMUYOR'
      rapor.push(satir)
      continue
    }

    satir.durum = uygula ? 'ODENMIS_DUZELTILDI' : 'ODENMIS_DUZELTILMEDI'

    if (uygula) {
      try {
        await prisma.$transaction(async (tx) => {
          for (const item of order.items) {
            const upd = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            })
            if (upd.count === 0) throw new Error(`Stok yetersiz: ${item.productId}`)
          }
          await tx.order.update({
            where: { id: order.id, status: 'PENDING' }, // yarış koşulu: callback araya girmişse dokunma
            data: { status: 'CONFIRMED', paidAt: new Date() },
          })
          if (order.couponId) {
            await tx.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } })
          }
        })

        const emailData = {
          orderId: order.id,
          total: parseFloat(order.total.toString()),
          shippingFee: parseFloat(order.shippingFee.toString()),
          customerName: order.shippingFullName,
          customerEmail: order.shippingEmail,
          customerPhone: order.shippingPhone,
          shippingAddress: order.shippingAddress,
          items: order.items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            price: parseFloat(i.price.toString()),
          })),
          isLoggedInUser: !!order.userId,
          siteUrl: process.env.NEXTAUTH_URL || 'https://www.lezizmama.com',
        }
        await Promise.allSettled([sendOrderConfirmation(emailData), sendAdminNotification(emailData)])
      } catch (err) {
        // Ödeme alınmış ama düzeltme yapılamadı — sipariş PENDING kalır, elle bakılır
        satir.durum = 'ODENMIS_DUZELTILEMEDI'
        satir.duzeltmeHatasi = err instanceof Error ? err.message : String(err)
        console.error('[mutabakat] düzeltme hatası:', order.id, err)
      }
    }

    rapor.push(satir)
  }

  const say = (d: string) => rapor.filter((r) => r.durum === d).length
  return {
    incelenen: pendings.length,
    ozet: {
      odenmis: say('ODENMIS_DUZELTILDI') + say('ODENMIS_DUZELTILMEDI'),
      odenmemis: say('ODENMEMIS'),
      tutarUyusmuyor: say('TUTAR_UYUSMUYOR'),
      sorgulanamadi: say('SORGULANAMADI'),
      duzeltilemedi: say('ODENMIS_DUZELTILEMEDI'),
    },
    rapor,
  }
}
