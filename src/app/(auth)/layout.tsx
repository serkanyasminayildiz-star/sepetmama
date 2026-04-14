export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <span className="text-3xl font-extrabold tracking-tight">
              <span className="text-orange-500">se</span>
              <span className="text-blue-600">Pet</span>
              <span className="text-orange-500">Mama</span>
            </span>
          </a>
        </div>
        {children}
      </div>
    </div>
  )
}
