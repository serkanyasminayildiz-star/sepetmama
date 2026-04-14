import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CartIcon from './CartIcon'
import { auth } from '@/auth'

export default async function Header() {
  const session = await auth()
  const categories = await prisma.category.findMany({
    where: { parentId: null, NOT: { slug: 'genel' } },
    orderBy: { name: 'asc' },
    take: 6,
  })

  return (
    <header className="bg-white border-b border-orange-100 h-14 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 shadow-sm">
      <Link href="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-base">🐾</div>
        <span className="text-[18px] font-extrabold tracking-tight">
          <span className="text-orange-500">se</span>
          <span className="text-blue-600">Pet</span>
          <span className="text-orange-500">Mama</span>
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-4 text-sm text-gray-500 font-semibold">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/kategori/${cat.slug}`} className="hover:text-orange-500 transition-colors whitespace-nowrap">
            {cat.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Link href="/giris" className="w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center text-base hover:bg-orange-50 transition-colors" title={session ? session.user.name || 'Hesabım' : 'Giriş Yap'}>
          {session ? '👤' : '🔑'}
        </Link>
        <CartIcon />
      </div>
    </header>
  )
}
