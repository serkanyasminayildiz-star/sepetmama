import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0E2A21] text-gray-400 px-6 pt-8 pb-4 mt-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-[20px] font-semibold mb-2 leading-none">
            <span className="text-gold">Leziz</span>
            <span className="text-white"> Mama</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px]">
            Evcil dostlarınız için en kaliteli mamalar ve aksesuarlar. Güvenli alışveriş, hızlı teslimat.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wide mb-3">Kurumsal</h4>
          <div className="flex flex-col gap-1.5">
            <Link href="/hakkimizda" className="text-[11px] text-gray-500 hover:text-gold transition-colors">Hakkımızda</Link>
            <Link href="/iletisim" className="text-[11px] text-gray-500 hover:text-gold transition-colors">İletişim</Link>
            <Link href="/yardim" className="text-[11px] text-gray-500 hover:text-gold transition-colors">Yardım Merkezi</Link>
            <Link href="/kargo-teslimat" className="text-[11px] text-gray-500 hover:text-gold transition-colors">Kargo & Teslimat</Link>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wide mb-3">Yasal</h4>
          <div className="flex flex-col gap-1.5">
            <Link href="/gizlilik" className="text-[11px] text-gray-500 hover:text-gold transition-colors">Gizlilik Politikası</Link>
            <Link href="/kullanim-kosullari" className="text-[11px] text-gray-500 hover:text-gold transition-colors">Kullanım Koşulları</Link>
            <Link href="/kvkk" className="text-[11px] text-gray-500 hover:text-gold transition-colors">KVKK Aydınlatma</Link>
            <Link href="/cerez-politikasi" className="text-[11px] text-gray-500 hover:text-gold transition-colors">Çerez Politikası</Link>
            <Link href="/iade-kosullari" className="text-[11px] text-gray-500 hover:text-gold transition-colors">İptal & İade</Link>
            <Link href="/mesafeli-satis-sozlesmesi" className="text-[11px] text-gray-500 hover:text-gold transition-colors">Mesafeli Satış Sözleşmesi</Link>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wide mb-3">İletişim</h4>
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] text-gray-500">📞 <span className="text-gold font-bold">+90 532 177 3721</span></p>
            <p className="text-[11px] text-gray-500">✉️ <span className="text-gold font-bold">info@lezizmama.com</span></p>
            <p className="text-[11px] text-gray-500 leading-relaxed">📍 Murat Reis Mah. Şehit Ceysu Ceylan Sok. No: 80/B Konak / İzmir</p>
            <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">Pazartesi – Cumartesi<br />09:00 – 18:00</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1E4536] pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-[10px] text-gray-600">© {new Date().getFullYear()} Yıldız Yazılım — Serkan Yıldız. Tüm hakları saklıdır.</p>
        <div className="flex gap-1.5">
          {['%100 Orijinal', 'SSL', 'KVKK'].map((badge) => (
            <span key={badge} className="bg-[#1E4536] text-gray-500 text-[9px] font-bold px-2 py-1 rounded-md">{badge}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
