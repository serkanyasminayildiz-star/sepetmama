'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const s: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '2px solid #E8D5B7',
  borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', background: 'white', color: '#2C1A0E',
}
const btn = (bg = '#E8845A', extra?: React.CSSProperties): React.CSSProperties => ({
  background: bg, color: 'white', border: 'none', borderRadius: 10,
  padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  fontFamily: 'inherit', whiteSpace: 'nowrap', ...extra,
})

export default function UrunlerClient({ products, total, sayfa, totalPages, categories, brands, searchParams }: any) {
  const router = useRouter()
  const [duzenle, setDuzenle] = useState<any>(null)
  const [bildirim, setBildirim] = useState('')
  const [inlineEdit, setInlineEdit] = useState<{ id: string; alan: string; deger: string } | null>(null)

  const goster = (msg: string) => { setBildirim(msg); setTimeout(() => setBildirim(''), 3000) }

  const filtrele = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams)
    if (val) params.set(key, val); else params.delete(key)
    params.delete('sayfa')
    router.push(`/admin/urunler?${params.toString()}`)
  }

  const urunGuncelle = async () => {
    const res = await fetch(`/api/admin/urun/${duzenle.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: duzenle.name,
        price: parseFloat(duzenle.price),
        salePrice: duzenle.salePrice ? parseFloat(duzenle.salePrice) : null,
        stock: parseInt(duzenle.stock),
        isActive: duzenle.isActive,
        description: duzenle.description,
        brand: duzenle.brand,
      }),
    })
    if (res.ok) { goster('✅ Ürün güncellendi'); setDuzenle(null); router.refresh() }
    else goster('❌ Hata oluştu')
  }

  const inlineKaydet = async () => {
    if (!inlineEdit) return
    const body: any = {}
    if (inlineEdit.alan === 'price') body.price = parseFloat(inlineEdit.deger)
    if (inlineEdit.alan === 'salePrice') body.salePrice = inlineEdit.deger ? parseFloat(inlineEdit.deger) : null
    if (inlineEdit.alan === 'stock') body.stock = parseInt(inlineEdit.deger)
    const res = await fetch(`/api/admin/urun/${inlineEdit.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (res.ok) { goster('✅ Güncellendi'); setInlineEdit(null); router.refresh() }
  }

  const aktifToggle = async (id: string, aktif: boolean) => {
    await fetch(`/api/admin/urun/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !aktif }) })
    router.refresh()
  }

  const urunSil = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/admin/urun/${id}`, { method: 'DELETE' })
    goster('✅ Ürün silindi'); router.refresh()
  }

  return (
    <div>
      {bildirim && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: bildirim.startsWith('❌') ? '#C62828' : '#2C1A0E', color: 'white', padding: '14px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 9999 }}>
          {bildirim}
        </div>
      )}

      {/* Ürün Düzenleme Modali */}
      {duzenle && (
        <div onClick={e => { if (e.target === e.currentTarget) setDuzenle(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#5C3D2E', margin: 0 }}>✏️ Ürün Düzenle</h2>
              <button onClick={() => setDuzenle(null)} style={{ background: '#F0EBE3', border: 'none', fontSize: 20, cursor: 'pointer', borderRadius: 8, width: 36, height: 36, color: '#5C3D2E' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>Ürün Adı</label>
                <input value={duzenle.name} onChange={e => setDuzenle({ ...duzenle, name: e.target.value })} style={s} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>Fiyat ₺</label>
                <input type="number" step="0.01" value={duzenle.price} onChange={e => setDuzenle({ ...duzenle, price: e.target.value })} style={s} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>İndirimli Fiyat ₺</label>
                <input type="number" step="0.01" value={duzenle.salePrice || ''} onChange={e => setDuzenle({ ...duzenle, salePrice: e.target.value })} style={s} placeholder="Boş = indirim yok" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>Stok</label>
                <input type="number" value={duzenle.stock} onChange={e => setDuzenle({ ...duzenle, stock: e.target.value })} style={s} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>Marka</label>
                <input value={duzenle.brand || ''} onChange={e => setDuzenle({ ...duzenle, brand: e.target.value })} style={s} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>Durum</label>
                <select value={duzenle.isActive ? '1' : '0'} onChange={e => setDuzenle({ ...duzenle, isActive: e.target.value === '1' })} style={s}>
                  <option value="1">✅ Aktif</option>
                  <option value="0">❌ Pasif</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>Açıklama</label>
                <textarea value={duzenle.description || ''} onChange={e => setDuzenle({ ...duzenle, description: e.target.value })} rows={4} style={{ ...s, resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={urunGuncelle} style={{ ...btn(), flex: 1, padding: '14px' }}>💾 Kaydet</button>
              <button onClick={() => setDuzenle(null)} style={btn('#888')}>İptal</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: '#2C1A0E' }}>
          Ürün Yönetimi <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.5 }}>{total} ürün</span>
        </h1>
      </div>

      {/* Filtreler */}
      <div style={{ background: 'white', borderRadius: 18, padding: '14px 18px', marginBottom: 12, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Ürün ara..."
          defaultValue={searchParams.arama || ''}
          onChange={e => filtrele('arama', e.target.value)}
          style={{ ...s, flex: 1, minWidth: 200, padding: '9px 14px' }}
        />
        <select value={searchParams.kategori || ''} onChange={e => filtrele('kategori', e.target.value)} style={{ ...s, width: 'auto' }}>
          <option value="">Tüm Kategoriler</option>
          {categories.map((k: any) => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
        <select value={searchParams.marka || ''} onChange={e => filtrele('marka', e.target.value)} style={{ ...s, width: 'auto' }}>
          <option value="">Tüm Markalar</option>
          {brands.map((m: string) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={searchParams.stok || ''} onChange={e => filtrele('stok', e.target.value)} style={{ ...s, width: 'auto' }}>
          <option value="">Tüm Stoklar</option>
          <option value="stokta">✅ Stokta Var</option>
          <option value="tukendi">❌ Stok Yok</option>
          <option value="kritik">⚠️ Kritik (≤5)</option>
        </select>
      </div>

      {/* Tablo */}
      <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAF5EF' }}>
                {['', 'ÜRÜN', 'FİYAT', 'İNDİRİMLİ', 'STOK', 'MARKA', 'KATEGORİ', 'DURUM', 'İŞLEM'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5C3D2E', opacity: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((urun: any) => {
                const image = urun.images[0]?.url
                const price = parseFloat(urun.price)
                const salePrice = urun.salePrice ? parseFloat(urun.salePrice) : null
                const kategori = urun.categories[0]?.category?.name

                return (
                  <tr key={urun.id} style={{ borderBottom: '1px solid #F5EFE8' }}>
                    <td style={{ padding: '6px 8px' }}>
                      <div style={{ width: 44, height: 44, background: '#FDF6EE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                        {image ? <Image src={image} alt={urun.name} fill style={{ objectFit: 'contain', padding: 4 }} sizes="44px" /> : <span style={{ fontSize: 18 }}>🐾</span>}
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, color: '#2C1A0E', fontSize: 12 }}>{urun.name?.substring(0, 50)}{urun.name?.length > 50 ? '…' : ''}</div>
                    </td>
                    {/* Inline fiyat */}
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      {inlineEdit?.id === urun.id && inlineEdit?.alan === 'price' ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input type="number" step="0.01" value={inlineEdit.deger} onChange={e => setInlineEdit({ ...inlineEdit, deger: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') inlineKaydet(); if (e.key === 'Escape') setInlineEdit(null) }} autoFocus style={{ width: 80, padding: '4px 6px', border: '2px solid #E8845A', borderRadius: 6, fontSize: 12, outline: 'none' }} />
                          <button onClick={inlineKaydet} style={{ background: '#E8845A', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                          <button onClick={() => setInlineEdit(null)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '4px 6px', fontSize: 11, cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <span onClick={() => setInlineEdit({ id: urun.id, alan: 'price', deger: String(price) })} style={{ fontWeight: 700, color: '#5C3D2E', cursor: 'pointer', borderBottom: '1px dashed #ccc' }}>
                          ₺{price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    {/* Inline indirimli */}
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      {inlineEdit?.id === urun.id && inlineEdit?.alan === 'salePrice' ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input type="number" step="0.01" value={inlineEdit.deger} onChange={e => setInlineEdit({ ...inlineEdit, deger: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') inlineKaydet(); if (e.key === 'Escape') setInlineEdit(null) }} autoFocus style={{ width: 80, padding: '4px 6px', border: '2px solid #E8845A', borderRadius: 6, fontSize: 12, outline: 'none' }} />
                          <button onClick={inlineKaydet} style={{ background: '#E8845A', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                          <button onClick={() => setInlineEdit(null)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '4px 6px', fontSize: 11, cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <span onClick={() => setInlineEdit({ id: urun.id, alan: 'salePrice', deger: String(salePrice || '') })} style={{ cursor: 'pointer' }}>
                          {salePrice ? <span style={{ color: '#E8845A', fontWeight: 700, borderBottom: '1px dashed #ccc' }}>₺{salePrice.toFixed(2)}</span> : <span style={{ color: '#ccc', borderBottom: '1px dashed #eee' }}>—</span>}
                        </span>
                      )}
                    </td>
                    {/* Inline stok */}
                    <td style={{ padding: '8px 10px' }}>
                      {inlineEdit?.id === urun.id && inlineEdit?.alan === 'stock' ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input type="number" value={inlineEdit.deger} onChange={e => setInlineEdit({ ...inlineEdit, deger: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') inlineKaydet(); if (e.key === 'Escape') setInlineEdit(null) }} autoFocus style={{ width: 60, padding: '4px 6px', border: '2px solid #E8845A', borderRadius: 6, fontSize: 12, outline: 'none' }} />
                          <button onClick={inlineKaydet} style={{ background: '#E8845A', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                          <button onClick={() => setInlineEdit(null)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '4px 6px', fontSize: 11, cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <span onClick={() => setInlineEdit({ id: urun.id, alan: 'stock', deger: String(urun.stock) })}
                          style={{ background: urun.stock > 10 ? '#E8F5E9' : urun.stock > 0 ? '#FFF8E1' : '#FFEBEE', color: urun.stock > 10 ? '#2E7D32' : urun.stock > 0 ? '#E65100' : '#C62828', padding: '3px 9px', borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          {urun.stock}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, opacity: 0.65 }}>{urun.brand || '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, opacity: 0.65 }}>{kategori || '—'}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <button onClick={() => aktifToggle(urun.id, urun.isActive)} style={{ background: urun.isActive ? '#E8F5E9' : '#FFEBEE', color: urun.isActive ? '#2E7D32' : '#C62828', border: 'none', padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        {urun.isActive ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => setDuzenle({ ...urun, price: String(price), salePrice: salePrice ? String(salePrice) : '', stock: String(urun.stock) })} style={{ background: '#FDF6EE', border: '2px solid #E8D5B7', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600, color: '#5C3D2E' }}>✏️</button>
                        <button onClick={() => urunSil(urun.id)} style={{ background: '#FFEBEE', border: 'none', borderRadius: 8, padding: '5px 9px', fontSize: 13, cursor: 'pointer', color: '#C62828' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div style={{ padding: '14px 18px', borderTop: '1px solid #F0E8E0', display: 'flex', justifyContent: 'center', gap: 6 }}>
            {sayfa > 1 && <button onClick={() => filtrele('sayfa', String(sayfa - 1))} style={btn('#5C3D2E', { padding: '6px 14px', fontSize: 12 })}>← Önceki</button>}
            <span style={{ padding: '6px 14px', background: '#E8845A', color: 'white', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>{sayfa} / {totalPages}</span>
            {sayfa < totalPages && <button onClick={() => filtrele('sayfa', String(sayfa + 1))} style={btn('#5C3D2E', { padding: '6px 14px', fontSize: 12 })}>Sonraki →</button>}
          </div>
        )}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#5C3D2E', opacity: 0.45, textAlign: 'center' }}>💡 Fiyat, indirimli fiyat ve stok hücrelerine tıklayarak hızlı düzenleme yapabilirsiniz</div>
    </div>
  )
}
