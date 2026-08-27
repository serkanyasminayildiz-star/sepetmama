'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { SHORT_DESC_MAX, TAG_MAX, kisaAciklamaTuret, slugify } from '@/lib/product-form'

const MAX_IMAGES = 6
const ETIKET_ONERILERI = ['Yeni', 'Çok Satan', 'Kampanya', 'Son Fırsat', 'Tükeniyor']

const s: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '2px solid #E8D5B7',
  borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', background: 'white', color: '#2C1A0E',
}
const btn = (bg = '#F2B33D', extra?: React.CSSProperties): React.CSSProperties => ({
  background: bg, color: 'white', border: 'none', borderRadius: 10,
  padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  fontFamily: 'inherit', whiteSpace: 'nowrap', ...extra,
})
const etiketStil: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5,
}

type Kategori = { id: string; name: string; parentId: string | null }
type Resim = { id: string; url: string }
type YerelResim = { file: File; onizleme: string }

export type UrunFormDegerleri = {
  id?: string
  slug?: string
  name: string
  shortDescription: string
  description: string
  brand: string
  tag: string
  categoryId: string
  price: string
  salePrice: string
  stock: string
  isActive: boolean
  isFeatured: boolean
  images: Resim[]
}

export const BOS_URUN: UrunFormDegerleri = {
  name: '', shortDescription: '', description: '', brand: '', tag: '', categoryId: '',
  price: '', salePrice: '', stock: '0', isActive: true, isFeatured: false, images: [],
}

export default function UrunFormModal({
  mod, baslangic, kategoriler, markalar, onKapat, onBitti,
}: {
  mod: 'yeni' | 'duzenle'
  baslangic: UrunFormDegerleri
  kategoriler: Kategori[]
  markalar: string[]
  onKapat: () => void
  onBitti: (mesaj: string) => void
}) {
  const [form, setForm] = useState<UrunFormDegerleri>(baslangic)
  const [yerelResimler, setYerelResimler] = useState<YerelResim[]>([])
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  // Kısa açıklama açıklamadan türetilsin mi? Kullanıcı elle yazınca kapanır.
  const [kisaOtomatik, setKisaOtomatik] = useState(!baslangic.shortDescription)

  // Seçilen dosyalar için üretilen önizleme URL'lerini serbest bırak
  useEffect(() => {
    return () => { yerelResimler.forEach((r) => URL.revokeObjectURL(r.onizleme)) }
  }, [yerelResimler])

  const set = (alan: keyof UrunFormDegerleri, deger: unknown) => setForm((f) => ({ ...f, [alan]: deger }))

  // Açıklama yazıldıkça kısa açıklama otomatik güncellenir (elle düzenlenmediyse)
  const aciklamaDegisti = (metin: string) => {
    setForm((f) => ({
      ...f,
      description: metin,
      shortDescription: kisaOtomatik ? kisaAciklamaTuret(metin) : f.shortDescription,
    }))
  }

  const kisaAciklamaDegisti = (metin: string) => {
    setKisaOtomatik(false)
    set('shortDescription', metin.slice(0, SHORT_DESC_MAX))
  }

  const kisaAciklamayiOtomatigeDondur = () => {
    setKisaOtomatik(true)
    set('shortDescription', kisaAciklamaTuret(form.description))
  }

  // Yeni üründe adres addan türetilir; mevcut üründe adres sabittir (SEO kırılmasın)
  const slugOnizleme = mod === 'yeni' ? slugify(form.name) : form.slug || ''

  const toplamResim = form.images.length + yerelResimler.length

  const resimEkle = (file: File) => {
    if (toplamResim >= MAX_IMAGES) return
    if (mod === 'yeni') {
      setYerelResimler((r) => [...r, { file, onizleme: URL.createObjectURL(file) }])
    } else {
      resimYukle(file)
    }
  }

  // Düzenleme modunda görsel doğrudan sunucuya gider (ürün zaten var)
  const resimYukle = async (file: File) => {
    if (!form.id || yukleniyor) return
    setYukleniyor(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`/api/admin/urun/${form.id}/image`, { method: 'POST', body: fd })
    setYukleniyor(false)
    if (res.ok) {
      const { image } = await res.json()
      setForm((f) => ({ ...f, images: [...f.images, image] }))
    } else {
      const data = await res.json().catch(() => ({}))
      setHata(data.error || 'Görsel yüklenemedi')
    }
  }

  const resimSil = async (imageId: string) => {
    if (!form.id) return
    if (!confirm('Görseli silmek istediğine emin misin?')) return
    const res = await fetch(`/api/admin/urun/${form.id}/image?imageId=${imageId}`, { method: 'DELETE' })
    if (res.ok) setForm((f) => ({ ...f, images: f.images.filter((i) => i.id !== imageId) }))
    else setHata('Görsel silinemedi')
  }

  const yerelResimSil = (index: number) => {
    setYerelResimler((r) => {
      URL.revokeObjectURL(r[index].onizleme)
      return r.filter((_, i) => i !== index)
    })
  }

  const govde = () => ({
    name: form.name,
    shortDescription: form.shortDescription,
    description: form.description,
    brand: form.brand,
    tag: form.tag,
    categoryId: form.categoryId,
    price: form.price,
    salePrice: form.salePrice,
    stock: form.stock,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
  })

  const kaydet = async () => {
    if (kaydediliyor) return
    setHata('')
    setKaydediliyor(true)

    const url = mod === 'yeni' ? '/api/admin/urun' : `/api/admin/urun/${form.id}`
    const res = await fetch(url, {
      method: mod === 'yeni' ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(govde()),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setHata(data.error || 'Kayıt sırasında hata oluştu')
      setKaydediliyor(false)
      return
    }

    if (mod === 'duzenle') {
      setKaydediliyor(false)
      onBitti('✅ Ürün güncellendi')
      return
    }

    // Yeni üründe görseller, ürün oluştuktan sonra sırayla yüklenir
    const { product } = await res.json()
    let basarisiz = 0
    for (const r of yerelResimler) {
      const fd = new FormData()
      fd.append('file', r.file)
      const up = await fetch(`/api/admin/urun/${product.id}/image`, { method: 'POST', body: fd })
      if (!up.ok) basarisiz++
    }

    setKaydediliyor(false)
    onBitti(
      basarisiz
        ? `⚠️ Ürün eklendi ama ${basarisiz} görsel yüklenemedi`
        : '✅ Ürün eklendi'
    )
  }

  const altKategoriEtiketi = (k: Kategori) => {
    if (!k.parentId) return k.name
    const ust = kategoriler.find((x) => x.id === k.parentId)
    return ust ? `${ust.name} › ${k.name}` : k.name
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !kaydediliyor) onKapat() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#5C3D2E', margin: 0 }}>
            {mod === 'yeni' ? '➕ Yeni Ürün Ekle' : '✏️ Ürün Düzenle'}
          </h2>
          <button onClick={onKapat} disabled={kaydediliyor} style={{ background: '#EDF1EB', border: 'none', fontSize: 20, cursor: kaydediliyor ? 'not-allowed' : 'pointer', borderRadius: 8, width: 36, height: 36, color: '#5C3D2E' }}>✕</button>
        </div>

        {hata && (
          <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
            ❌ {hata}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={etiketStil}>Ürün Adı *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} style={s} placeholder="Örn: Royal Canin Kitten Yavru Kedi Maması 2 Kg" autoFocus />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <label style={etiketStil}>
              SEO Adresi <span style={{ opacity: 0.6, fontWeight: 500 }}>(ürün adından otomatik oluşur)</span>
            </label>
            <div style={{ ...s, background: '#FAF5EF', color: '#5C3D2E', opacity: slugOnizleme ? 1 : 0.5, fontSize: 13, overflowX: 'auto', whiteSpace: 'nowrap' }}>
              lezizmama.com/urun/<strong>{slugOnizleme || '…'}</strong>
            </div>
            {mod === 'duzenle' && (
              <div style={{ fontSize: 11, color: '#5C3D2E', opacity: 0.5, marginTop: 4 }}>
                Yayındaki ürünün adresi, arama motorlarındaki sıralaması bozulmasın diye değişmez.
              </div>
            )}
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <label style={etiketStil}>Açıklama <span style={{ opacity: 0.6, fontWeight: 500 }}>(ürün sayfasındaki uzun metin)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => aciklamaDegisti(e.target.value)}
              rows={5}
              style={{ ...s, resize: 'vertical' }}
              placeholder="Ürünün detaylı tanıtımı — kısa açıklama buradan otomatik oluşturulur."
            />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <label style={etiketStil}>
              Kısa Açıklama{' '}
              <span style={{ opacity: 0.6, fontWeight: 500 }}>
                (ürün sayfasında başlık altında — {form.shortDescription.length}/{SHORT_DESC_MAX})
              </span>{' '}
              {kisaOtomatik ? (
                <span style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: 50, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
                  otomatik
                </span>
              ) : (
                <button
                  type="button"
                  onClick={kisaAciklamayiOtomatigeDondur}
                  style={{ background: '#F6F3E9', border: '1px solid #E8D5B7', borderRadius: 50, padding: '1px 8px', fontSize: 10, fontWeight: 700, color: '#5C3D2E', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ↺ otomatiğe dön
                </button>
              )}
            </label>
            <input
              value={form.shortDescription}
              onChange={(e) => kisaAciklamaDegisti(e.target.value)}
              style={s}
              placeholder="Açıklamayı yazınca burası kendiliğinden dolar — istersen elle değiştirebilirsin"
            />
          </div>

          <div>
            <label style={etiketStil}>Marka</label>
            <input value={form.brand} onChange={(e) => set('brand', e.target.value)} list="marka-listesi" style={s} placeholder="Marka seç veya yaz" />
            <datalist id="marka-listesi">
              {markalar.map((m) => <option key={m} value={m} />)}
            </datalist>
          </div>

          <div>
            <label style={etiketStil}>Kategori</label>
            <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} style={s}>
              <option value="">— Kategori seçilmedi —</option>
              {kategoriler.map((k) => <option key={k.id} value={k.id}>{altKategoriEtiketi(k)}</option>)}
            </select>
          </div>

          <div>
            <label style={etiketStil}>Fiyat ₺ * <span style={{ opacity: 0.6, fontWeight: 500 }}>(eski/liste fiyatı)</span></label>
            <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} style={s} placeholder="0.00" />
          </div>

          <div>
            <label style={etiketStil}>İndirimli Fiyat ₺ <span style={{ opacity: 0.6, fontWeight: 500 }}>(yeni fiyat)</span></label>
            <input type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} style={s} placeholder="Boş = indirim yok" />
          </div>

          <div>
            <label style={etiketStil}>Stok</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} style={s} />
          </div>

          <div>
            <label style={etiketStil}>Etiket <span style={{ opacity: 0.6, fontWeight: 500 }}>(vitrin rozeti, max {TAG_MAX})</span></label>
            <input value={form.tag} onChange={(e) => set('tag', e.target.value.slice(0, TAG_MAX))} list="etiket-listesi" style={s} placeholder="Örn: Çok Satan" />
            <datalist id="etiket-listesi">
              {ETIKET_ONERILERI.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div>
            <label style={etiketStil}>Durum</label>
            <select value={form.isActive ? '1' : '0'} onChange={(e) => set('isActive', e.target.value === '1')} style={s}>
              <option value="1">✅ Aktif (sitede yayında)</option>
              <option value="0">❌ Pasif (gizli)</option>
            </select>
          </div>

          <div>
            <label style={etiketStil}>Öne Çıkan</label>
            <select value={form.isFeatured ? '1' : '0'} onChange={(e) => set('isFeatured', e.target.value === '1')} style={s}>
              <option value="0">☆ Normal</option>
              <option value="1">⭐ Anasayfada öne çıkar</option>
            </select>
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <label style={etiketStil}>
              Görseller <span style={{ opacity: 0.6, fontWeight: 500 }}>({toplamResim}/{MAX_IMAGES} — max 5MB, JPG/PNG/WEBP)</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {form.images.map((img) => (
                <div key={img.id} style={{ position: 'relative', aspectRatio: '1', background: '#F6F3E9', borderRadius: 10, overflow: 'hidden', border: '2px solid #E8D5B7' }}>
                  <Image src={img.url} alt="" fill style={{ objectFit: 'contain', padding: 4 }} sizes="100px" />
                  <button type="button" onClick={() => resimSil(img.id)} title="Görseli sil" style={{ position: 'absolute', top: 3, right: 3, background: '#C62828', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 11, fontWeight: 700, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              {yerelResimler.map((r, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', background: '#F6F3E9', borderRadius: 10, overflow: 'hidden', border: '2px dashed #F2B33D' }}>
                  {/* Yerel önizleme: henüz sunucuya gitmedi, next/image kullanılamaz */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.onizleme} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                  <button type="button" onClick={() => yerelResimSil(i)} title="Kaldır" style={{ position: 'absolute', top: 3, right: 3, background: '#C62828', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 11, fontWeight: 700, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              {toplamResim < MAX_IMAGES && (
                <label style={{ aspectRatio: '1', background: yukleniyor ? '#EDF1EB' : '#F6F3E9', borderRadius: 10, border: '2px dashed #E8D5B7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: yukleniyor ? 'wait' : 'pointer', fontSize: 28, color: '#F2B33D', fontWeight: 700 }}>
                  {yukleniyor ? '⏳' : '+'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={yukleniyor}
                    style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) resimEkle(f); e.target.value = '' }}
                  />
                </label>
              )}
            </div>
            {mod === 'yeni' && yerelResimler.length > 0 && (
              <div style={{ fontSize: 11, color: '#5C3D2E', opacity: 0.5, marginTop: 6 }}>
                Görseller, ürün kaydedildikten sonra yüklenecek.
              </div>
            )}
          </div>

        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={kaydet} disabled={kaydediliyor} style={{ ...btn(kaydediliyor ? '#C9A88F' : '#F2B33D'), flex: 1, padding: '14px', cursor: kaydediliyor ? 'wait' : 'pointer' }}>
            {kaydediliyor ? '⏳ Kaydediliyor…' : mod === 'yeni' ? '➕ Ürünü Ekle' : '💾 Kaydet'}
          </button>
          <button onClick={onKapat} disabled={kaydediliyor} style={btn('#888')}>İptal</button>
        </div>
      </div>
    </div>
  )
}
