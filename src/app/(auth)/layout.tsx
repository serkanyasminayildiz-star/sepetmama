import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-semibold tracking-tight">
              <span className="text-orange-500">Leziz</span>
              <span className="text-gray-800"> Mama</span>
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
