import Header from '@/app/(home)/components/Header'
import Footer from '@/app/(home)/components/Footer'
import CartClient from './CartClient'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { FirstOrderStatus } from '@/lib/firstOrder'

export default async function SepetPage() {
  const session = await auth()
  let firstOrderStatus: FirstOrderStatus = 'guest'
  if (session?.user?.id) {
    const paid = await prisma.order.count({ where: { userId: session.user.id, paidAt: { not: null } } })
    firstOrderStatus = paid === 0 ? 'eligible' : 'used'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-6">🛒 Sepetim</h1>
        <CartClient firstOrderStatus={firstOrderStatus} />
      </div>
      <Footer />
    </div>
  )
}
