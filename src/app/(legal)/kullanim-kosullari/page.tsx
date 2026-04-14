export default function KullanimKosullariPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2 pb-4 border-b border-gray-100">Kullanım Koşulları</h1>
      <p className="text-xs text-gray-400 mb-6">Son güncelleme tarihi: 01/02/2026</p>
      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        {[
          { title: '1. Üyelik ve Hesap', content: 'Web sitemizi kullanmak için üyelik oluşturmanız gerekebilir. Hesap bilgilerinizin güncel ve doğru olduğundan emin olun. Hesabınızın güvenliğinden siz sorumlusunuz.' },
          { title: '2. İçerik ve Telif Hakkı', content: 'Web sitemizde bulunan tüm içerikler (metin, görseller, videolar vb.) firmamıza aittir veya izin alınarak kullanılmıştır. İçeriklerimizi izinsiz olarak kopyalamak, dağıtmak veya kullanmak yasaktır.' },
          { title: '3. Siparişler ve Ödemeler', content: 'Sipariş verirken doğru ve güncel bilgileri sağladığınızdan emin olun. Ödeme işlemleri güvenli bir şekilde işlenir.' },
          { title: '4. İptal, İade ve Değişim', content: 'İptal, iade ve değişim politikalarımız hakkında daha fazla bilgi almak için İptal & İade & Değişim Politikası sayfamızı ziyaret edin.' },
          { title: '5. Gizlilik ve Güvenlik', content: 'Gizlilik politikamızı inceleyerek kişisel bilgilerinizin nasıl işlendiği hakkında bilgi edinin.' },
          { title: '6. Sorumluluk Reddi', content: 'Web sitemizden sunulan içeriklerin doğruluğu ve eksiksizliği konusunda garanti vermemekteyiz.' },
          { title: '7. İletişim', content: 'Herhangi bir soru veya geri bildirim için info@sepetmama.com adresi üzerinden bizimle iletişime geçebilirsiniz.' },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="font-extrabold text-gray-800 mb-2">{section.title}</h2>
            <p>{section.content}</p>
          </div>
        ))}
      </div>
    </article>
  )
}
