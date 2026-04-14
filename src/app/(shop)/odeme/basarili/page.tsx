export default function BasariliPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-green-100 p-10 text-center max-w-md">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Ödeme Başarılı!</h1>
        <p className="text-gray-500 mb-6">Siparişiniz alındı. En kısa sürede kargoya verilecektir.</p>
        <a href="/" className="bg-orange-500 text-white font-extrabold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors">Ana Sayfaya Dön</a>
      </div>
    </div>
  )
}
