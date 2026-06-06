import type { Metadata } from 'next'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/(home)/components/Header'
import Footer from '@/app/(home)/components/Footer'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Hesabım',
  robots: { index: false, follow: false },
}

export default async function HesabimPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/giris')
  }

  const { user } = session

  // Hesaba tanımlı, kullanılabilir kuponlar (süresi dolmamış + limiti dolmamış)
  const now = new Date()
  const myCoupons = (
    await prisma.coupon.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  ).filter(
    (c) =>
      (!c.expiresAt || c.expiresAt > now) &&
      (c.maxUses == null || c.usedCount < c.maxUses)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Hesabım</h1>

        <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-4">
          <h2 className="font-extrabold text-gray-800 mb-3">Bilgiler</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">Ad Soyad</span>
              <span className="font-semibold text-gray-800">{user.name || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">E-posta</span>
              <span className="font-semibold text-gray-800">{user.email}</span>
            </div>
          </div>
        </div>

        {myCoupons.length > 0 && (
          <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-4">
            <h2 className="font-extrabold text-gray-800 mb-3">🎁 Kuponlarım</h2>
            <div className="flex flex-col gap-3">
              {myCoupons.map((c) => {
                const val = parseFloat(c.value.toString())
                const min = c.minOrder ? parseFloat(c.minOrder.toString()) : 0
                const indirim = c.type === 'PERCENT' ? `%${val}` : `₺${val.toLocaleString('tr-TR')}`
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-lg font-extrabold text-orange-600">{indirim} indirim</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {min > 0 && <>Min. ₺{min.toLocaleString('tr-TR')} sepet</>}
                        {c.expiresAt && <> · Son kullanım: {new Date(c.expiresAt).toLocaleDateString('tr-TR')}</>}
                      </p>
                    </div>
                    <span className="font-mono font-extrabold text-sm bg-gray-800 text-white px-3 py-1.5 rounded-lg tracking-wider">
                      {c.code}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">Kodu ödeme adımında &quot;İndirim kodu&quot; alanına yazarak kullanabilirsiniz.</p>
          </div>
        )}

        <Link
          href="/siparislerim"
          className="block bg-white rounded-2xl border border-orange-100 p-4 mb-4 hover:shadow-md hover:border-orange-200 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              📦
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-gray-800">Siparişlerim</p>
              <p className="text-xs text-gray-500">Tüm siparişlerini ve durumlarını gör</p>
            </div>
            <span className="text-orange-500 font-bold">→</span>
          </div>
        </Link>

        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4 mb-4">
          <p className="text-sm text-orange-700">
            <span className="font-bold">Yakında:</span> Adres yönetimi, favoriler.
          </p>
        </div>

        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="w-full bg-white border border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors"
          >
            Çıkış Yap
          </button>
        </form>
      </div>
      <Footer />
    </div>
  )
}
