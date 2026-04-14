export default function IletisimPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b border-gray-100">Bize Ulaşın</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <p className="text-gray-600 mb-6">Sorularınız, talepleriniz ve siparişlerinizle ilgili bizimle iletişime geçebilirsiniz. En kısa sürede size dönüş sağlıyoruz.</p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-orange-500 text-xl">📞</span>
              <div>
                <p className="font-extrabold text-gray-800 text-sm">Müşteri Hizmetleri</p>
                <p className="text-gray-600 text-sm">+90 532 489 7846</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-500 text-xl">🕐</span>
              <div>
                <p className="font-extrabold text-gray-800 text-sm">Çalışma Saatleri</p>
                <p className="text-gray-600 text-sm">09:00 - 18:00</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-500 text-xl">✉️</span>
              <div>
                <p className="font-extrabold text-gray-800 text-sm">E-posta</p>
                <p className="text-gray-600 text-sm">info@sepetmama.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-500 text-xl">📍</span>
              <div>
                <p className="font-extrabold text-gray-800 text-sm">Adres</p>
                <p className="text-gray-600 text-sm">Konak / İzmir</p>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-orange-50 rounded-xl p-3 border border-orange-100">
            <p className="text-xs text-orange-700">Göndermiş olduğunuz mesajlar en geç 24 saat içerisinde müşteri temsilcilerimiz tarafından yanıtlanır.</p>
          </div>
        </div>
        <div>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-extrabold text-gray-600 mb-1 block">Ad *</label>
                <input type="text" placeholder="Adınız" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-extrabold text-gray-600 mb-1 block">Soyad *</label>
                <input type="text" placeholder="Soyadınız" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-extrabold text-gray-600 mb-1 block">E-posta *</label>
              <input type="email" placeholder="E-posta adresiniz" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-extrabold text-gray-600 mb-1 block">Mesajınız</label>
              <textarea rows={4} placeholder="Mesajınızı yazın..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none" />
            </div>
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5" />
                <span className="text-xs text-gray-600">KVKK Aydınlatma Metni'ni okudum, anladım ve kabul ediyorum.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5" />
                <span className="text-xs text-gray-600">Açık Rıza Metni'ni okudum, anladım ve kabul ediyorum.</span>
              </label>
            </div>
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl transition-colors">Gönder</button>
          </form>
        </div>
      </div>
    </article>
  )
}
