export default function HakkimizdaPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b border-gray-100">Hakkımızda</h1>
      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-4">
        <p>SepetMama, evcil hayvanların sağlıklı, mutlu ve kaliteli bir yaşam sürmesi için ihtiyaç duydukları ürünleri güvenilir, hızlı ve ekonomik şekilde sunmak amacıyla kurulmuş bir e-ticaret platformudur.</p>
        <p>TNB Pet Mamaları ve Aksesuarları İthalat İhracat Sanayi ve Ticaret Limited Şirketi bünyesinde faaliyet gösteren SepetMama, kedi ve köpek başta olmak üzere tüm evcil dostlarımız için mama, bakım ve aksesuar ürünlerini titizlikle seçerek müşterilerine ulaştırmaktadır.</p>
        <h2 className="text-lg font-extrabold text-gray-800 mt-6 mb-3">SepetMama olarak önceliğimiz:</h2>
        <ul className="list-none space-y-2">
          {['Güvenilir markalar', 'Orijinal ve faturalı ürünler', 'Hızlı kargo ve şeffaf teslimat süreci', 'Satış öncesi ve sonrası güçlü müşteri desteği'].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-orange-500 font-extrabold">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>sunarak kullanıcılarımıza sorunsuz bir alışveriş deneyimi yaşatmaktır.</p>
        <p>Hayvansever bir ekip olarak, patili dostlarımızın yalnızca beslenme değil, bakım, sağlık ve mutluluk ihtiyaçlarını da önemsiyoruz. Bu doğrultuda hem bireysel evcil hayvan sahiplerine hem de sokak hayvanlarına yönelik sosyal sorumluluk projelerinde yer almayı ve bu alanda sürdürülebilir katkılar sağlamayı hedefliyoruz.</p>
        <p>SepetMama'te her sipariş, güvenli ödeme altyapısı ile korunur, ürünleriniz özenle paketlenerek en kısa sürede adresinize ulaştırılır.</p>
        <div className="bg-orange-50 rounded-xl p-4 mt-6 border border-orange-100">
          <p className="text-sm font-semibold text-orange-700">"SepetMama, Türkiye Cumhuriyeti mevzuatına uygun olarak faaliyet gösteren, faturalı satış yapan bir e-ticaret sitesidir."</p>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-800 mb-3">Firma Bilgileri</h2>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">Ünvan:</span> SepetMama – EV HAYVANLARI, BUNLARIN MAMA VE GIDALARI İLE EŞYALARININ PERAKENDE TİCARETİ</p>
            <p><span className="font-semibold">Vergi Dairesi:</span> Konak</p>
            <p><span className="font-semibold">Vergi No:</span> 9650295235</p>
            <p><span className="font-semibold">E-posta:</span> info@sepetmama.com</p>
            <p><span className="font-semibold">Telefon:</span> +90 532 489 7846</p>
          </div>
        </div>
      </div>
    </article>
  )
}
