export default function KvkkPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2 pb-4 border-b border-gray-100">KVKK Aydınlatma Metni</h1>
      <p className="text-xs text-gray-400 mb-6">Son güncelleme tarihi: 01/02/2026</p>
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verileriniz, veri sorumlusu sıfatıyla <strong>SepetMama – EV HAYVANLARI, BUNLARIN MAMA VE GIDALARI İLE EŞYALARININ PERAKENDE TİCARETİ</strong> tarafından işlenmektedir.</p>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">Kişisel Verilerin İşlenme Amaçları</h2>
          <p>Kişisel verileriniz; hizmetlerimizin sunulabilmesi, iletişim faaliyetlerinin yürütülmesi, talep ve şikayetlerin değerlendirilmesi, yasal yükümlülüklerin yerine getirilmesi, hukuki ve ticari güvenliğin sağlanması amacıyla işlenmektedir.</p>
        </div>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">Toplanan Kişisel Veriler</h2>
          <p>Kimlik bilgileri (ad, soyad), iletişim bilgileri (telefon, e-posta, adres), işlem güvenliği verileri.</p>
        </div>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">KVKK Kapsamındaki Haklarınız</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
            <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>Hukuka aykırı işleme nedeniyle zarara uğramanız halinde tazminat talep etme</li>
          </ul>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
          <p><span className="font-semibold">Vergi Dairesi:</span> Konak</p>
          <p><span className="font-semibold">Vergi No:</span> 9650295235</p>
          <p><span className="font-semibold">Adres:</span> Atilla Mah. 349. Sok. No:55/A Konak/İzmir</p>
          <p><span className="font-semibold">Telefon:</span> +90 532 489 7846</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="font-semibold text-orange-700">İletişim: <a href="mailto:info@sepetmama.com" className="underline">info@sepetmama.com</a></p>
        </div>
      </div>
    </article>
  )
}
