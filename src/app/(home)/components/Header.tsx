import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Header() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, NOT: { slug: 'genel' } },
    orderBy: { name: 'asc' },
  })

  return (
    <header className="bg-white border-b border-orange-100 h-14 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg">🐾</div>
        <span className="text-[20px] font-extrabold tracking-tight">
          <span className="text-orange-500">se</span>
          <span className="text-blue-600">Pet</span>
          <span className="text-orange-500">Mama</span>
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500 font-semibold">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/kategori/${cat.slug}`} className="hover:text-orange-500 transition-colors">
            {cat.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center text-base hover:bg-orange-50 transition-colors">🔍</button>
        <button className="w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center text-base hover:bg-orange-50 transition-colors">❤️</button>
        <button className="relative w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center text-base hover:bg-orange-50 transition-colors">
          🛒
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">3</span>
        </button>
      </div>
    </header>
  )
}