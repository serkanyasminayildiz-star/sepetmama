export default function BasarisizPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-red-100 p-10 text-center max-w-md">
        <p className="text-5xl mb-4">❌</p>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Ödeme Başarısız</h1>
        <p className="text-gray-500 mb-6">Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.</p>
        <a href="/sepet" className="bg-orange-500 text-white font-extrabold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors">Sepete Dön</a>
      </div>
    </div>
  )
}
