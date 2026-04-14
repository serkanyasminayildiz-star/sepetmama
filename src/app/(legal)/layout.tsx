import Header from '@/app/(home)/components/Header'
import Footer from '@/app/(home)/components/Footer'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {children}
      </div>
      <Footer />
    </div>
  )
}
