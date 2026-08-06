import Header from '@/app/(home)/components/Header'
import Footer from '@/app/(home)/components/Footer'
import OdemeClient from './OdemeClient'

export default function OdemePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Ödeme</h1>
        <OdemeClient />
      </div>
      <Footer />
    </div>
  )
}
