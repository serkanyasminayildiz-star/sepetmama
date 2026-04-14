export default function CerezPolitikasiPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2 pb-4 border-b border-gray-100">Çerez Politikası</h1>
      <p className="text-xs text-gray-400 mb-6">Son güncelleme tarihi: 01/02/2026</p>
      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">Çerez Nedir?</h2>
          <p>Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar, web sitesinin sizinle etkileşimde bulunmasını ve size özel bir deneyim sunmasını sağlar.</p>
        </div>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">Hangi Tür Çerezleri Kullanıyoruz?</h2>
          <div className="space-y-3">
            {[
              { title: 'Zorunlu Çerezler', desc: 'Web sitemizin temel işlevselliğini sağlamak için kullanılır. Oturum açma bilgilerinizi hatırlayarak size kişiselleştirilmiş bir deneyim sunarlar.' },
              { title: 'Analitik ve Performans Çerezleri', desc: 'Ziyaretçi trafiğini analiz eder ve web sitemizin performansını ölçer. Kullanıcı deneyimini iyileştirmemize yardımcı olur.' },
              { title: 'Reklam ve Hedefleme Çerezleri', desc: 'İlgi alanlarınıza dayalı olarak reklamları kişiselleştirmek için kullanılır.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-3">
                <p className="font-semibold text-gray-800 mb-1">{item.title}</p>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
          <p>Tarayıcınızın ayarları üzerinden çerezleri kabul etmeyi veya reddetmeyi seçebilirsiniz.</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="font-semibold text-orange-700">İletişim: <a href="mailto:info@sepetmama.com" className="underline">info@sepetmama.com</a></p>
        </div>
      </div>
    </article>
  )
}
