import type { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import Header from '@/app/(home)/components/Header'
import Footer from '@/app/(home)/components/Footer'
import { getStatusMeta } from '@/lib/order-status'

export const metadata: Metadata = {
  title: 'Sipariş Detay',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SiparisDetayPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/giris')

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
      total: true,
      shippingFee: true,
      createdAt: true,
      paidAt: true,
      cargoCompany: true,
      cargoTrackingNo: true,
      shippingFullName: true,
      shippingEmail: true,
      shippingPhone: true,
      shippingAddress: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 },
            },
          },
        },
      },
    },
  })

  // Yoksa veya başkasının siparişiyse 404 (PII leak engellemek için)
  if (!order || order.userId !== session.user.id) notFound()

  const status = getStatusMeta(order.status)
  const total = parseFloat(order.total.toString())
  const shipping = parseFloat(order.shippingFee.toString())
  const subtotal = total - shipping

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/siparislerim" className="inline-block text-sm text-gray-500 hover:text-orange-500 mb-4">
          ← Siparişlerim
        </Link>

        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
          <h1 className="text-2xl font-extrabold text-gray-800">
            Sipariş <span className="font-mono">#{order.id.slice(-8).toUpperCase()}</span>
          </h1>
          <span className="text-sm text-gray-400">
            {new Date(order.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Durum + ödeme badge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: status.bg, color: status.color }}
          >
            <span className="text-2xl">{status.emoji}</span>
            <div>
              <p className="font-extrabold">{status.label}</p>
              <p className="text-xs opacity-80">{status.description}</p>
            </div>
          </div>
          <div
            className={`rounded-2xl p-4 flex items-center gap-3 ${
              order.paidAt ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
            }`}
          >
            <span className="text-2xl">{order.paidAt ? '💰' : '💳'}</span>
            <div>
              <p className="font-extrabold">{order.paidAt ? 'Ödendi' : 'Ödeme bekleniyor'}</p>
              {order.paidAt && (
                <p className="text-xs opacity-80">
                  {new Date(order.paidAt).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Kargo bilgisi */}
        {(order.cargoCompany || order.cargoTrackingNo) && (
          <div className="bg-purple-50 rounded-2xl p-4 mb-4">
            <p className="text-xs font-extrabold text-purple-700 uppercase mb-1">🚚 Kargo Bilgisi</p>
            <div className="flex items-center gap-3 flex-wrap text-sm">
              {order.cargoCompany && <span className="font-bold text-gray-800">{order.cargoCompany}</span>}
              {order.cargoTrackingNo && (
                <span className="font-mono font-bold text-purple-700 bg-white px-2 py-0.5 rounded">
                  {order.cargoTrackingNo}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Ürünler */}
        <div className="bg-white rounded-2xl border border-orange-100 p-4 mb-4">
          <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide mb-3">Ürünler</h2>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => {
              const lineTotal = parseFloat(item.price.toString()) * item.quantity
              const image = item.product?.images[0]?.url
              return (
                <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-shell rounded-xl overflow-hidden">
                    {image ? (
                      <Image src={image} alt={item.product?.name || ''} fill sizes="64px" className="object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.product?.slug ? (
                      <Link href={`/urun/${item.product.slug}`} className="text-sm font-bold text-gray-800 hover:text-orange-500 line-clamp-2">
                        {item.product.name}
                      </Link>
                    ) : (
                      <p className="text-sm font-bold text-gray-800 line-clamp-2">{item.product?.name || 'Ürün'}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {item.quantity} adet × ₺{parseFloat(item.price.toString()).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-orange-500 whitespace-nowrap">
                    ₺{lineTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Teslimat adresi */}
        <div className="bg-white rounded-2xl border border-orange-100 p-4 mb-4">
          <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide mb-3">Teslimat Adresi</h2>
          <p className="text-sm font-bold text-gray-800">{order.shippingFullName}</p>
          <p className="text-xs text-gray-500 mt-0.5">📞 {order.shippingPhone}</p>
          <p className="text-xs text-gray-500">✉ {order.shippingEmail}</p>
          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{order.shippingAddress}</p>
        </div>

        {/* Sipariş özeti */}
        <div className="bg-white rounded-2xl border border-orange-100 p-4">
          <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide mb-3">Sipariş Özeti</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Ara Toplam</span>
              <span className="font-semibold text-gray-800">
                ₺{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kargo</span>
              <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                {shipping === 0 ? 'Ücretsiz' : `₺${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <span className="font-extrabold text-gray-800">Toplam</span>
              <span className="font-extrabold text-orange-500 text-lg">
                ₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
