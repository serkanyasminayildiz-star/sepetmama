export default function KargoTeslimatPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2 pb-4 border-b border-gray-100">Kargo & Teslimat</h1>
      <p className="text-xs text-gray-400 mb-6">Son güncelleme tarihi: 01/02/2026</p>
      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        {[
          { title: '1. Kargo Seçenekleri', content: 'Siparişleriniz anlaşmalı olduğumuz MNG Kargo ile gönderilir.' },
          { title: '2. Teslimat Süresi', content: 'Ürünlerinizin teslimat süresi, sipariş verilen ürünlerin türüne bağlı olarak değişebilir. Siparişiniz kargoya verildiğinde tahmini teslimat tarihini takip edebilirsiniz.' },
          { title: '3. Sipariş İzleme', content: 'Siparişiniz kargoya verildiğinde size bir takip numarası ve kargo şirketi bilgisi sağlanacaktır.' },
          { title: '4. Teslimat Adresi', content: 'Lütfen sipariş verirken doğru teslimat adresi ve iletişim bilgilerini sağladığınızdan emin olun.' },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="font-extrabold text-gray-800 mb-2">{section.title}</h2>
            <p>{section.content}</p>
          </div>
        ))}
        <div>
          <h2 className="font-extrabold text-gray-800 mb-3">5. Teslimat Ücretleri</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3 border border-green-100">
              <span className="text-green-500 text-lg">🚚</span>
              <p className="text-green-700 font-semibold">1.000 TL üzeri siparişlerde kargo ücretsizdir.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p>1.000 TL altındaki siparişlerde kargo ücreti ödeme adımında gösterilir.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p>Ücretsiz kargo kampanyaları dönemsel olarak değişiklik gösterebilir.</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="font-semibold text-orange-700">Sorularınız için: <a href="mailto:info@sepetmama.com" className="underline">info@sepetmama.com</a> | +90 532 489 7846</p>
        </div>
      </div>
    </article>
  )
}
