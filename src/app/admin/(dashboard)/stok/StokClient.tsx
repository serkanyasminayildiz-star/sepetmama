'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const btn = (bg = '#E8845A', extra?: React.CSSProperties): React.CSSProperties => ({
  background: bg, color: 'white', border: 'none', borderRadius: 10,
  padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  fontFamily: 'inherit', whiteSpace: 'nowrap', ...extra,
})

export default function StokClient({ products, istatistik, tip }: any) {
  const router = useRouter()
  const [bildirim, setBildirim] = useState('')
  const [stokEdit, setStokEdit] = useState<{ id: string; deger: string } | null>(null)

  const goster = (msg: string) => { setBildirim(msg); setTimeout(() => setBildirim(''), 3000) }

  const filtrele = (t: string) => router.push(`/admin/stok?tip=${t}`)

  const stokGuncelle = async () => {
    if (!stokEdit) return
    const res = await fetch(`/api/admin/urun/${stokEdit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: parseInt(stokEdit.deger) }),
    })
    if (res.ok) { goster('✅ Stok güncellendi'); setStokEdit(null); router.refresh() }
    else goster('❌ Hata oluştu')
  }

  return (
    <div>
      {bildirim && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: bildirim.startsWith('❌') ? '#C62828' : '#2C1A0E', color: 'white', padding: '14px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 9999 }}>
          {bildirim}
        </div>
      )}

      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: '#2C1A0E', marginBottom: 20 }}>📉 Stok Takibi</h1>

      {/* Özet kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Toplam Aktif', deger: istatistik.toplamAktif, renk: '#8BAF8E', bg: '#F1F8F2', icon: '📦' },
          { label: 'Stok Tükendi', deger: istatistik.stokYok, renk: '#C62828', bg: '#FFEBEE', icon: '❌' },
          { label: 'Kritik Stok (1–5)', deger: istatistik.kritik, renk: '#E65100', bg: '#FFF3E0', icon: '⚠️' },
          { label: 'Düşük Stok (6–10)', deger: istatistik.dusuk, renk: '#F57F17', bg: '#FFF9C4', icon: '📉' },
        ].map((k) => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 18, padding: 20, border: `2px solid ${k.renk}22` }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 34, fontWeight: 700, color: k.renk }}>{k.deger}</div>
            <div style={{ fontSize: 12, color: '#5C3D2E', opacity: 0.7, marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtre tablar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {([
          ['tukendi', '❌ Stok Yok', istatistik.stokYok],
          ['kritik', '⚠️ Kritik (1–5)', istatistik.kritik],
          ['dusuk', '📉 Düşük (6–10)', istatistik.dusuk],
        ] as [string, string, number][]).map(([t, lbl, sayi]) => (
          <button key={t} onClick={() => filtrele(t)}
            style={{ ...btn(tip === t ? '#E8845A' : '#E8D5B7'), color: tip === t ? 'white' : '#5C3D2E', padding: '9px 20px', fontSize: 13 }}>
            {lbl} {sayi > 0 && <span style={{ marginLeft: 6, background: tip === t ? 'rgba(255,255,255,0.3)' : '#E8845A', color: 'white', borderRadius: 50, fontSize: 10, padding: '1px 7px' }}>{sayi}</span>}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', overflow: 'hidden' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, color: '#8BAF8E', fontWeight: 600 }}>Bu kategoride sorun yok!</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAF5EF' }}>
                {['', 'ÜRÜN ADI', 'KATEGORİ', 'MARKA', 'MEVCUT STOK', 'HIZLI GÜNCELLE'].map(h => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5C3D2E', opacity: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((urun: any) => {
                const image = urun.images[0]?.url
                const kategori = urun.categories[0]?.category?.name
                return (
                  <tr key={urun.id} style={{ borderBottom: '1px solid #F5EFE8' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ width: 44, height: 44, background: '#FDF6EE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                        {image ? <Image src={image} alt={urun.name} fill style={{ objectFit: 'contain', padding: 4 }} sizes="44px" /> : <span style={{ fontSize: 18 }}>🐾</span>}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ fontWeight: 600, color: '#2C1A0E' }}>{urun.name?.substring(0, 50)}{urun.name?.length > 50 ? '…' : ''}</div>
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: 12, opacity: 0.6 }}>{kategori || '—'}</td>
                    <td style={{ padding: '8px 12px', fontSize: 12, opacity: 0.6 }}>{urun.brand || '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: urun.stock === 0 ? '#FFEBEE' : urun.stock <= 5 ? '#FFF3E0' : '#FFF9C4', color: urun.stock === 0 ? '#C62828' : urun.stock <= 5 ? '#E65100' : '#F57F17', padding: '4px 12px', borderRadius: 50, fontSize: 14, fontWeight: 700 }}>
                        {urun.stock}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {stokEdit?.id === urun.id ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="number" value={stokEdit!.deger} onChange={e => setStokEdit(prev => prev ? { ...prev, deger: e.target.value } : null)} autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') stokGuncelle(); if (e.key === 'Escape') setStokEdit(null) }}
                            style={{ width: 80, padding: '6px 10px', border: '2px solid #E8845A', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                          <button onClick={stokGuncelle} style={{ ...btn(), padding: '6px 14px', fontSize: 12 }}>✓ Kaydet</button>
                          <button onClick={() => setStokEdit(null)} style={{ ...btn('#888'), padding: '6px 10px', fontSize: 12 }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setStokEdit({ id: urun.id, deger: String(urun.stock) })} style={{ background: '#FDF6EE', border: '2px solid #E8D5B7', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600, color: '#5C3D2E' }}>
                          ✏️ Stok Gir
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
