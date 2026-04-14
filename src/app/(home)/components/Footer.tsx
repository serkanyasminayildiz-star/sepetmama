import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-400 px-6 pt-8 pb-4 mt-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="col-span-2 md:col-span-1">
          <div className="text-[18px] font-extrabold mb-2">
            <span className="text-orange-500">se</span>
            <span className="text-blue-400">Pet</span>
            <span className="text-orange-500">Mama</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px]">
            Evcil dostlarınız için en kaliteli mamalar ve aksesuarlar. Güvenli alışveriş, hızlı teslimat.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wide mb-3">Kurumsal</h4>
          <div className="flex flex-col gap-1.5">
            <Link href="/hakkimizda" className="text-[11px] text-gray-500 hover:text-orange-500 transition-colors">Hakkımızda</Link>
            <Link href="/iletisim" className="text-[11px] text-gray-500 hover:text-orange-500 transition-colors">İletişim</Link>
            <Link href="/yardim" className="text-[11px] text-gray-500 hover:text-orange-500 transition-colors">Yardım Merkezi</Link>
            <Link href="/kargo-teslimat" className="text-[11px] text-gray-500 hover:text-orange-500 transition-colors">Kargo & Teslimat</Link>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wide mb-3">Yasal</h4>
          <div className="flex flex-col gap-1.5">
            <Link href="/gizlilik" className="text-[11px] text-gray-500 hover:text-orange-500 transition-colors">Gizlilik Politikası</Link>
            <Link href="/kullanim-kosullari" className="text-[11px] text-gray-500 hover:text-orange-500 transition-colors">Kullanım Koşulları</Link>
            <Link href="/kvkk" className="text-[11px] text-gray-500 hover:text-orange-500 transition-colors">KVKK Aydınlatma</Link>
            <Link href="/cerez-politikasi" className="text-[11px] text-gray-500 hover:text-orange-500 transition-colors">Çerez Politikası</Link>
            <Link href="/iade-kosullari" className="text-[11px] text-gray-500 hover:text-orange-500 transition-colors">İptal & İade</Link>
            <Link href="/mesafeli-satis-sozlesmesi" className="text-[11px] text-gray-500 hover:text-orange-500 transition-colors">Mesafeli Satış Sözleşmesi</Link>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wide mb-3">İletişim</h4>
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] text-gray-500">📞 <span className="text-orange-500 font-bold">+90 532 489 7846</span></p>
            <p className="text-[11px] text-gray-500">✉️ <span className="text-orange-500 font-bold">info@sepetmama.com</span></p>
            <p className="text-[11px] text-gray-500">📍 Konak / İzmir</p>
            <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">Pazartesi – Cumartesi<br />09:00 – 18:00</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a2a3e] pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-[10px] text-gray-600">© 2025 Yıldız Yazılım — Serkan Yıldız. Tüm hakları saklıdır.</p>
        <div className="flex gap-1.5">
          {['iyzico', 'SSL', 'KVKK'].map((badge) => (
            <span key={badge} className="bg-[#2a2a3e] text-gray-500 text-[9px] font-bold px-2 py-1 rounded-md">{badge}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
