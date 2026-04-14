export default function AcikRizaPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2 pb-4 border-b border-gray-100">Açık Rıza Metni</h1>
      <p className="text-xs text-gray-400 mb-6">Son güncelleme tarihi: 01/02/2026</p>
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, KVKK Aydınlatma Metni'ni okuduğumu ve anladığımı beyan ederim.</p>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">Kişisel verilerimin işlenme amaçları:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Talep ve şikayet süreçlerinin yürütülmesi</li>
            <li>İletişim faaliyetlerinin gerçekleştirilmesi</li>
            <li>Hizmet süreçlerinin iyileştirilmesi</li>
          </ul>
        </div>
        <p>Kimlik, iletişim ve işlem güvenliğine ilişkin kişisel verilerimin yukarıdaki amaçlarla işlenmesine açık rıza verdiğimi kabul ve beyan ederim.</p>
        <p>Açık rızamı dilediğim zaman geri çekebileceğimi bildiğimi kabul ederim.</p>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="font-semibold text-orange-700">İletişim: <a href="mailto:info@sepetmama.com" className="underline">info@sepetmama.com</a></p>
        </div>
      </div>
    </article>
  )
}
