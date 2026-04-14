const sections = [
  {
    title: 'Siparişler & Satın Almalar',
    items: ['Siparişim Nerede?', 'Siparişimi nasıl iptal edebilirim?', 'Siparişim neden iptal edildi?', 'Siparişimin tamamını alamadım, neden?', 'Siparişimle ilgili bir sorun olursa ne olur?', 'İade barkodunu nasıl alabilirim?'],
  },
  {
    title: 'Üyelik',
    items: ['Şifremi nasıl sıfırlarım?', 'Şifremi nasıl değiştirebilirim?', 'Hesabımı nasıl iptal edebilirim?'],
  },
  {
    title: 'İadeler & Geri Ödemeler',
    items: ['Geri ödemem nerede?', 'Siparişimi nasıl iade edebilirim?', 'İade politikası nedir?'],
  },
  {
    title: 'Kargo & Takip',
    items: ['Kargo ücreti ne kadar?', 'Teslimat adresimi nasıl değiştiririm?', 'Siparişim henüz gelmedi. Ne yapmalıyım?', 'Kargom kaç günde gelir?'],
  },
  {
    title: 'Ücretler & Faturalandırma',
    items: ['Satın aldığım ürünün faturası ne zaman kesilir?', 'Faturam hala kesilmedi, ne yapmalıyım?'],
  },
  {
    title: 'Diğer',
    items: ['Anlık indirimleri nasıl öğrenebilirim?', 'Daha fazla bilgiyi nereden alabilirim?', 'Mağaza konumlarını ve çalışma saatlerini nereden görebilirim?'],
  },
]

export default function YardimPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b border-gray-100">Yardım Merkezi</h1>
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-extrabold text-gray-800 mb-3 text-base">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer group">
                  <span className="text-sm text-gray-600 group-hover:text-orange-600">{item}</span>
                  <span className="text-gray-300 group-hover:text-orange-400">›</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-orange-50 rounded-xl p-4 border border-orange-100 text-center">
        <p className="font-extrabold text-gray-800 mb-1">Sorunuzu bulamadınız mı?</p>
        <p className="text-sm text-gray-600 mb-3">Müşteri hizmetlerimizle iletişime geçin.</p>
        <a href="/iletisim" className="inline-block bg-orange-500 text-white font-extrabold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors text-sm">Bize Ulaşın</a>
      </div>
    </article>
  )
}
