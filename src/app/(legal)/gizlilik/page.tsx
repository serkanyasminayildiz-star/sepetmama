export default function GizlilikPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2 pb-4 border-b border-gray-100">Gizlilik Politikası</h1>
      <p className="text-xs text-gray-400 mb-6">Son güncelleme tarihi: 02/01/2026</p>
      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        {[
          { title: '1. Genel Bilgiler', content: 'SepetMama, müşterilerinin ve ziyaretçilerinin gizliliğini korumayı taahhüt eder. Bu gizlilik politikası, firmanın web sitesi veya mobil uygulama üzerinden sunulan hizmetlerle ilgili olarak kişisel bilgilerin nasıl toplandığını, kullanıldığını, paylaşıldığını ve korunduğunu açıklar.' },
          { title: '2. Toplanan Bilgiler', content: 'Firma; adınız, soyadınız, e-posta adresiniz, telefon numaranız gibi doğrudan sizi tanımlayan kişisel bilgiler ile site kullanımınıza ilişkin teknik bilgileri toplayabilir.' },
          { title: '3. Bilgilerin Kullanımı', content: 'Toplanan bilgiler; sipariş işleme, müşteri hizmetleri sağlama, ürün ve kampanya duyuruları gönderme, site ve uygulama kullanımını analiz etme amaçlarıyla kullanılabilir.' },
          { title: '4. Bilgi Paylaşımı', content: 'Firma, kişisel bilgilerinizi yasal gereksinimler dışında ve kullanıcı izni olmaksızın üçüncü taraflarla paylaşmaz. Ödeme işleme şirketleri gibi hizmet sağlayıcılarla yalnızca gizliliğinizi koruma taahhüdümüz çerçevesinde bilgi paylaşılır.' },
          { title: '5. Güvenlik', content: 'Firma, kişisel bilgilerinizi korumak için endüstri standartlarına uygun güvenlik önlemleri alır.' },
          { title: '6. Çerezler', content: 'Firma, site kullanımınızı analiz etmek ve iyileştirmek amacıyla çerezler kullanabilir. Detaylı bilgi için Çerez Politikamızı inceleyebilirsiniz.' },
          { title: '7. İletişim', content: 'Gizlilik politikamız veya kişisel bilgilerinizle ilgili sorularınız için: info@sepetmama.com' },
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
