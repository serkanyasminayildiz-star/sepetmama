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
        <Link href={session ? '/hesabim' : '/giris'} className="w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center hover:bg-orange-50 transition-colors" title={session ? 'Hesabım' : 'Giriş Yap'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </Link>
        <Link href="/favoriler" className="w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center hover:bg-orange-50 transition-colors" title="Favoriler">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </Link>
        <CartIcon />
      </div>
    </header>
  )
}
