export default function MesafeliSatisSozlesmesiPage() {
  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2 pb-4 border-b border-gray-100">Mesafeli Satış Sözleşmesi</h1>
      <p className="text-xs text-gray-400 mb-6">Son güncelleme tarihi: 01/02/2026</p>
      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">4. Satıcı Bilgileri</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            <p><span className="font-semibold">Ünvanı:</span> SepetMama – EV HAYVANLARI, BUNLARIN MAMA VE GIDALARI İLE EŞYALARININ PERAKENDE TİCARETİ</p>
            <p><span className="font-semibold">Adres:</span> Atilla Mah. 349. Sok. No:55 İç Kapı No:A Konak/İzmir</p>
            <p><span className="font-semibold">Vergi Dairesi:</span> Konak</p>
            <p><span className="font-semibold">Vergi No:</span> 9650295235</p>
            <p><span className="font-semibold">Telefon:</span> +90 532 489 7846</p>
            <p><span className="font-semibold">E-posta:</span> info@sepetmama.com</p>
          </div>
        </div>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">10. Cayma Hakkı</h2>
          <p>ALICI, ürünün teslim tarihinden itibaren <strong>14 gün</strong> içerisinde hiçbir gerekçe göstermeksizin sözleşmeden cayma hakkını kullanabilir. Cayma hakkının kullanımından kaynaklanan masraflar SATICI'ya aittir.</p>
        </div>
        <div>
          <h2 className="font-extrabold text-gray-800 mb-2">13. Yetkili Mahkeme</h2>
          <p>İşbu sözleşmeden doğan uyuşmazlıklarda tüketicinin yerleşim yerinin bulunduğu yerdeki tüketici sorunları hakem heyetine veya tüketici mahkemesine başvurulacaktır.</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="text-xs text-orange-700">Sözleşmenin tam metnini talep etmek için <a href="mailto:info@sepetmama.com" className="underline">info@sepetmama.com</a> adresine yazabilirsiniz.</p>
        </div>
      </div>
    </article>
  )
}
