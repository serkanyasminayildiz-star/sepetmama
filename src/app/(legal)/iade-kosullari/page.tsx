export default function IadeKosullariPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2 pb-4 border-b border-gray-100">İptal & İade & Değişim</h1>
      <p className="text-xs text-gray-400 mb-6">Son güncelleme tarihi: 01/02/2026</p>
      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">1. İptal Politikası</h2>
          <p className="mb-2">Siparişinizi iptal etmek için, siparişi verdikten sonraki <strong>24 saat</strong> içinde bize bildirmeniz gerekmektedir.</p>
          <p>İptal işlemi için <strong>info@sepetmama.com</strong> veya <strong>+90 532 489 7846</strong> numaralı hattımızdan bizimle iletişime geçebilirsiniz.</p>
        </div>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">2. İade Politikası</h2>
          <p className="mb-2">Ürünü teslim aldıktan sonraki <strong>14 gün</strong> içinde iade talebinizi iletebilirsiniz.</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>İade edilecek ürünlerin kullanılmamış, ambalajı hasar görmemiş ve satılabilir durumda olması gerekir.</li>
            <li>İade adresi: Atilla Mah. 349. Sok. No:55/A Konak/İzmir</li>
            <li>Ayıplı veya hatalı ürünlerde iade kargo ücreti firmamıza aittir.</li>
            <li>Diğer iade durumlarında kargo ücreti müşteriye aittir.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">3. Değişim Politikası</h2>
          <p className="mb-2">Ürünü teslim aldıktan sonraki <strong>14 gün</strong> içinde değişim talebinde bulunabilirsiniz.</p>
          <p>Değiştirmek istediğiniz ürün kullanılmamış, ambalajı hasar görmemiş ve satılabilir durumda olmalıdır.</p>
          <p className="mt-2">Değişim adresi: Atilla Mah. 349. Sok. No:55/A Konak/İzmir</p>
        </div>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">4. İletişim</h2>
          <p>İptal, iade veya değişim işlemleri için: <strong>info@sepetmama.com</strong> veya <strong>+90 532 489 7846</strong></p>
        </div>
      </div>
    </article>
  )
}
