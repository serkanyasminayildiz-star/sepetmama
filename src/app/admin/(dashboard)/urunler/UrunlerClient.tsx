'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import UrunFormModal, { BOS_URUN, type UrunFormDegerleri } from './UrunFormModal'

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

function getPageNumbers(current: number, total: number): (number | 'gap')[] {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1)
  const window = 2
  const result: (number | 'gap')[] = [1]
  if (current - window > 2) result.push('gap')
  for (let i = Math.max(2, current - window); i <= Math.min(total - 1, current + window); i++) {
    result.push(i)
  }
  if (current + window < total - 1) result.push('gap')
  result.push(total)
  return result
}

type Kategori = { id: string; name: string; parentId: string | null }

type AdminUrun = {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  brand: string | null
  tag: string | null
  price: string
  salePrice: string | null
  stock: number
  isActive: boolean
  isFeatured: boolean
  images: { id: string; url: string }[]
  categories: { categoryId: string; category?: { name: string } }[]
}

type Props = {
  products: AdminUrun[]
  total: number
  sayfa: number
  totalPages: number
  categories: Kategori[]
  brands: string[]
  searchParams: Record<string, string | undefined>
}

export default function UrunlerClient({ products, total, sayfa, totalPages, categories, brands, searchParams }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<{ mod: 'yeni' | 'duzenle'; degerler: UrunFormDegerleri } | null>(null)
  const [bildirim, setBildirim] = useState('')
  const [inlineEdit, setInlineEdit] = useState<{ id: string; alan: string; deger: string } | null>(null)

  const goster = (msg: string) => { setBildirim(msg); setTimeout(() => setBildirim(''), 3000) }

  const filtrele = (key: string, val: string) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter((e): e is [string, string] => e[1] !== undefined)
    )
    if (val) params.set(key, val); else params.delete(key)
    if (key !== 'sayfa') params.delete('sayfa')
    router.push(`/admin/urunler?${params.toString()}`)
  }

  const yeniUrun = () => setForm({ mod: 'yeni', degerler: { ...BOS_URUN } })

  const urunDuzenle = (urun: AdminUrun) => setForm({
    mod: 'duzenle',
    degerler: {
      id: urun.id,
      slug: urun.slug,
      name: urun.name || '',
      shortDescription: urun.shortDescription || '',
      description: urun.description || '',
      brand: urun.brand || '',
      tag: urun.tag || '',
      categoryId: urun.categories?.[0]?.categoryId || '',
      price: String(parseFloat(urun.price)),
      salePrice: urun.salePrice ? String(parseFloat(urun.salePrice)) : '',
      stock: String(urun.stock),
      isActive: urun.isActive,
      isFeatured: urun.isFeatured,
      images: urun.images || [],
    },
  })

  const formBitti = (mesaj: string) => { goster(mesaj); setForm(null); router.refresh() }

  const inlineKaydet = async () => {
    if (!inlineEdit) return
    const body: Record<string, number | null> = {}
    if (inlineEdit.alan === 'price') body.price = parseFloat(inlineEdit.deger)
    if (inlineEdit.alan === 'salePrice') body.salePrice = inlineEdit.deger ? parseFloat(inlineEdit.deger) : null
    if (inlineEdit.alan === 'stock') body.stock = parseInt(inlineEdit.deger)
    const res = await fetch(`/api/admin/urun/${inlineEdit.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (res.ok) { goster('✅ Güncellendi'); setInlineEdit(null); router.refresh(); return }
    const data = await res.json().catch(() => ({}))
    goster('❌ ' + (data.error || 'Güncellenemedi'))
  }

  const aktifToggle = async (id: string, aktif: boolean) => {
    await fetch(`/api/admin/urun/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !aktif }) })
    router.refresh()
  }

  const oneCikanToggle = async (id: string, featured: boolean) => {
    await fetch(`/api/admin/urun/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isFeatured: !featured }) })
    goster(featured ? '☆ Öne çıkandan kaldırıldı' : '⭐ Öne çıkana eklendi')
    router.refresh()
  }

  const urunSil = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    const res = await fetch(`/api/admin/urun/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      // Siparişi/yorumu olan ürün veri bütünlüğü için silinemez
      goster('❌ Silinemedi — bu ürünün sipariş geçmişi olabilir, "Pasif" yapmayı deneyin')
      return
    }
    goster('✅ Ürün silindi'); router.refresh()
  }


  return (
    <div>
      {bildirim && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: bildirim.startsWith('❌') ? '#C62828' : '#2C1A0E', color: 'white', padding: '14px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 9999 }}>
          {bildirim}
        </div>
      )}

      {form && (
        <UrunFormModal
          mod={form.mod}
          baslangic={form.degerler}
          kategoriler={categories}
          markalar={brands}
          onKapat={() => setForm(null)}
          onBitti={formBitti}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: '#2C1A0E' }}>
          Ürün Yönetimi <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.5 }}>{total} ürün</span>
        </h1>
        <button onClick={yeniUrun} style={btn('#F2B33D', { padding: '12px 22px', fontSize: 14 })}>
          ➕ Yeni Ürün
        </button>
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
          {categories.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
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
        <select value={searchParams.onecikan || ''} onChange={e => filtrele('onecikan', e.target.value)} style={{ ...s, width: 'auto' }}>
          <option value="">Tümü (öne çıkan)</option>
          <option value="evet">⭐ Öne Çıkanlar</option>
          <option value="hayir">☆ Öne Çıkmayanlar</option>
        </select>
      </div>

      {/* Tablo */}
      <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAF5EF' }}>
                {['', 'ÜRÜN', 'FİYAT', 'İNDİRİMLİ', 'STOK', 'MARKA', 'KATEGORİ', 'DURUM', '⭐', 'İŞLEM'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5C3D2E', opacity: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((urun) => {
                const image = urun.images[0]?.url
                const price = parseFloat(urun.price)
                const salePrice = urun.salePrice ? parseFloat(urun.salePrice) : null
                const kategori = urun.categories[0]?.category?.name

                return (
                  <tr key={urun.id} style={{ borderBottom: '1px solid #F5EFE8' }}>
                    <td style={{ padding: '6px 8px' }}>
                      <div style={{ width: 44, height: 44, background: '#F6F3E9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                        {image ? <Image src={image} alt={urun.name} fill style={{ objectFit: 'contain', padding: 4 }} sizes="44px" /> : <span style={{ fontSize: 18 }}>🐾</span>}
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, color: '#2C1A0E', fontSize: 12 }}>{urun.name?.substring(0, 50)}{urun.name?.length > 50 ? '…' : ''}</div>
                      {urun.tag && (
                        <span style={{ display: 'inline-block', marginTop: 4, background: '#FFF1E8', color: '#F2B33D', border: '1px solid #F5C9AE', borderRadius: 50, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
                          {urun.tag}
                        </span>
                      )}
                    </td>
                    {/* Inline fiyat */}
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      {inlineEdit?.id === urun.id && inlineEdit?.alan === 'price' ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input type="number" step="0.01" value={inlineEdit.deger} onChange={e => setInlineEdit({ ...inlineEdit, deger: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') inlineKaydet(); if (e.key === 'Escape') setInlineEdit(null) }} autoFocus style={{ width: 80, padding: '4px 6px', border: '2px solid #F2B33D', borderRadius: 6, fontSize: 12, outline: 'none' }} />
                          <button onClick={inlineKaydet} style={{ background: '#F2B33D', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>✓</button>
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
                          <input type="number" step="0.01" value={inlineEdit.deger} onChange={e => setInlineEdit({ ...inlineEdit, deger: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') inlineKaydet(); if (e.key === 'Escape') setInlineEdit(null) }} autoFocus style={{ width: 80, padding: '4px 6px', border: '2px solid #F2B33D', borderRadius: 6, fontSize: 12, outline: 'none' }} />
                          <button onClick={inlineKaydet} style={{ background: '#F2B33D', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                          <button onClick={() => setInlineEdit(null)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '4px 6px', fontSize: 11, cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <span onClick={() => setInlineEdit({ id: urun.id, alan: 'salePrice', deger: String(salePrice || '') })} style={{ cursor: 'pointer' }}>
                          {salePrice ? <span style={{ color: '#F2B33D', fontWeight: 700, borderBottom: '1px dashed #ccc' }}>₺{salePrice.toFixed(2)}</span> : <span style={{ color: '#ccc', borderBottom: '1px dashed #eee' }}>—</span>}
                        </span>
                      )}
                    </td>
                    {/* Inline stok */}
                    <td style={{ padding: '8px 10px' }}>
                      {inlineEdit?.id === urun.id && inlineEdit?.alan === 'stock' ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input type="number" value={inlineEdit.deger} onChange={e => setInlineEdit({ ...inlineEdit, deger: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') inlineKaydet(); if (e.key === 'Escape') setInlineEdit(null) }} autoFocus style={{ width: 60, padding: '4px 6px', border: '2px solid #F2B33D', borderRadius: 6, fontSize: 12, outline: 'none' }} />
                          <button onClick={inlineKaydet} style={{ background: '#F2B33D', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>✓</button>
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
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <button onClick={() => oneCikanToggle(urun.id, urun.isFeatured)} title={urun.isFeatured ? 'Öne çıkandan kaldır' : 'Öne çıkana ekle'} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }}>
                        {urun.isFeatured ? '⭐' : '☆'}
                      </button>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => urunDuzenle(urun)} style={{ background: '#F6F3E9', border: '2px solid #E8D5B7', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600, color: '#5C3D2E' }}>✏️</button>
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
          <div style={{ padding: '14px 18px', borderTop: '1px solid #F0E8E0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => filtrele('sayfa', String(sayfa - 1))}
              disabled={sayfa <= 1}
              style={{ background: sayfa <= 1 ? '#EDF1EB' : '#F6F3E9', color: sayfa <= 1 ? '#999' : '#5C3D2E', border: '1px solid #E8D5B7', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: sayfa <= 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              ← Önceki
            </button>

            {getPageNumbers(sayfa, totalPages).map((p, i) =>
              p === 'gap' ? (
                <span key={'gap-' + i} style={{ padding: '6px 6px', color: '#999', fontSize: 12 }}>…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => filtrele('sayfa', String(p))}
                  style={{
                    background: p === sayfa ? '#F2B33D' : '#F6F3E9',
                    color: p === sayfa ? 'white' : '#5C3D2E',
                    border: '1px solid ' + (p === sayfa ? '#F2B33D' : '#E8D5B7'),
                    borderRadius: 8, padding: '6px 11px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', minWidth: 32,
                  }}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => filtrele('sayfa', String(sayfa + 1))}
              disabled={sayfa >= totalPages}
              style={{ background: sayfa >= totalPages ? '#EDF1EB' : '#F6F3E9', color: sayfa >= totalPages ? '#999' : '#5C3D2E', border: '1px solid #E8D5B7', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: sayfa >= totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              Sonraki →
            </button>

            <span style={{ marginLeft: 8, fontSize: 12, color: '#5C3D2E', opacity: 0.6 }}>{sayfa} / {totalPages}</span>
          </div>
        )}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#5C3D2E', opacity: 0.45, textAlign: 'center' }}>💡 Fiyat, indirimli fiyat ve stok hücrelerine tıklayarak hızlı düzenleme yapabilirsiniz</div>
    </div>
  )
}
