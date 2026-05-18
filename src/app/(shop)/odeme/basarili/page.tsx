import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CartClear from './CartClear'
import PurchaseTracker from '@/components/PurchaseTracker'

interface PageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function BasariliPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          status: true,
          total: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              product: { select: { id: true, name: true } },
            },
          },
        },
      })
    : null

  const isPending = order?.status === 'PENDING'
  const totalNum = order ? parseFloat(order.total.toString()) : 0
  const totalStr = order ? totalNum.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : null

  const trackingItems =
    order?.items.map((item) => ({
      item_id: item.product.id,
      item_name: item.product.name,
      price: parseFloat(item.price.toString()),
      quantity: item.quantity,
    })) || []

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <CartClear />
      {order && order.status === 'CONFIRMED' && (
        <PurchaseTracker orderId={order.id} value={totalNum} items={trackingItems} />
      )}
      <div className="bg-white rounded-2xl border border-green-100 p-10 text-center max-w-md w-full">
        <p className="text-5xl mb-4">{isPending ? '⏳' : '🎉'}</p>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
          {isPending ? 'Ödemeniz işleniyor' : 'Ödeme Başarılı!'}
        </h1>
        <p className="text-gray-500 mb-6">
          {isPending
            ? 'Banka onayı bekleniyor. Onay tamamlandığında siparişiniz kargoya verilecektir.'
            : 'Siparişiniz alındı. En kısa sürede kargoya verilecektir.'}
        </p>

        {order && (
          <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Sipariş No</span>
              <span className="font-mono font-bold text-gray-800">#{order.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Ürün Adedi</span>
              <span className="font-semibold text-gray-800">{order.items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Toplam</span>
              <span className="font-extrabold text-orange-500">₺{totalStr}</span>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="inline-block bg-orange-500 text-white font-extrabold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
