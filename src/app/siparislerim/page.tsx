import type { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Header from '@/app/(home)/components/Header'
import Footer from '@/app/(home)/components/Footer'
import { getStatusMeta } from '@/lib/order-status'

export const metadata: Metadata = {
  title: 'Siparişlerim',
  robots: { index: false, follow: false },
}

export default async function SiparislerimPage() {
  const session = await auth()
  if (!session?.user) redirect('/giris')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      status: true,
      total: true,
      paidAt: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">📦 Siparişlerim</h1>
        <p className="text-sm text-gray-500 mb-6">
          {orders.length > 0 ? `Toplam ${orders.length} sipariş` : 'Henüz sipariş yok'}
        </p>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-orange-100 p-10 text-center">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-lg font-extrabold text-gray-700 mb-2">Henüz sipariş yok</p>
            <p className="text-gray-500 mb-6">İlk siparişini ver, burada listelenecek.</p>
            <Link
              href="/"
              className="inline-block bg-orange-500 text-white font-extrabold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const status = getStatusMeta(order.status)
              const total = parseFloat(order.total.toString())
              return (
                <Link
                  key={order.id}
                  href={`/siparis/${order.id}`}
                  className="block bg-white rounded-2xl border border-orange-100 p-4 hover:shadow-md hover:border-orange-200 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-bold text-gray-800">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.emoji} {status.label}
                      </span>
                      {order.paidAt ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-green-50 text-green-700">
                          💰 Ödendi
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-50 text-orange-700">
                          💳 Ödeme bekleniyor
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold text-orange-500">
                        ₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-orange-500 font-semibold text-sm">Detay →</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{order._count.items} ürün</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
