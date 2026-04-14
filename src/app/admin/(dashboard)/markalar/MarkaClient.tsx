'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function MarkaClient({ brands }: { brands: string[] }) {
  const router = useRouter()
  const [bildirim, setBildirim] = useState('')
  const [yeni, setYeni] = useState('')
  const [duzenle, setDuzenle] = useState<{ eski: string; yeni: string } | null>(null)

  const goster = (msg: string) => { setBildirim(msg); setTimeout(() => setBildirim(''), 3000) }

  const ekle = async () => {
    if (!yeni.trim()) { goster('⚠️ Marka adı zorunludur!'); return }
    const res = await fetch('/api/admin/marka', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand: yeni.trim() }),
    })
    if (res.ok) { goster('✅ Marka eklendi'); setYeni(''); router.refresh() }
    else goster('❌ Hata oluştu')
  }

  const guncelle = async () => {
    if (!duzenle) return
    const res = await fetch('/api/admin/marka', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldBrand: duzenle.eski, newBrand: duzenle.yeni }),
    })
    if (res.ok) { goster('✅ Marka güncellendi'); setDuzenle(null); router.refresh() }
    else goster('❌ Hata oluştu')
  }

  const sil = async (brand: string) => {
    if (!confirm(`"${brand}" markasını silmek istediğinizden emin misiniz? Ürünlerden kaldırılacak.`)) return
    const res = await fetch('/api/admin/marka', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand }),
    })
    if (res.ok) { goster('✅ Marka silindi'); router.refresh() }
    else goster('❌ Hata oluştu')
  }

  return (
    <div>
      {bildirim && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: bildirim.startsWith('❌') || bildirim.startsWith('⚠️') ? '#C62828' : '#2C1A0E', color: 'white', padding: '14px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 9999 }}>
          {bildirim}
        </div>
      )}

      {/* Düzenleme Modali */}
      {duzenle && (
        <div onClick={e => { if (e.target === e.currentTarget) setDuzenle(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#5C3D2E', marginBottom: 20 }}>🏷️ Marka Düzenle</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>Yeni Marka Adı</label>
              <input value={duzenle.yeni} onChange={e => setDuzenle({ ...duzenle, yeni: e.target.value })} style={s} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={guncelle} style={{ ...btn(), flex: 1 }}>💾 Kaydet</button>
              <button onClick={() => setDuzenle(null)} style={btn('#888')}>İptal</button>
            </div>
          </div>
        </div>
      )}

      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: '#2C1A0E', marginBottom: 20 }}>
        Markalar <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.5 }}>({brands.length})</span>
      </h1>

      {/* Yeni Marka */}
      <div style={{ background: 'white', borderRadius: 18, padding: 22, marginBottom: 16, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', border: '2px solid #E8845A' }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: '#2C1A0E', marginBottom: 14 }}>➕ Yeni Marka Ekle</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D2E', opacity: 0.6, display: 'block', marginBottom: 4 }}>MARKA ADI *</label>
            <input value={yeni} onChange={e => setYeni(e.target.value)} onKeyDown={e => e.key === 'Enter' && ekle()} style={s} placeholder="Örn: Royal Canin" />
          </div>
          <button onClick={ekle} style={{ ...btn(), padding: '12px 22px' }}>✅ Ekle</button>
        </div>
      </div>

      {/* Liste */}
      <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAF5EF' }}>
              {['#', 'Marka Adı', 'İşlem'].map(h => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5C3D2E', opacity: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((brand, i) => (
              <tr key={brand} style={{ borderBottom: '1px solid #F0E8E0' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FDFAF7'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                <td style={{ padding: '12px', fontSize: 12, opacity: 0.4, width: 40 }}>{i + 1}</td>
                <td style={{ padding: '12px', fontSize: 14, fontWeight: 600 }}>{brand}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setDuzenle({ eski: brand, yeni: brand })} style={{ background: '#FDF6EE', border: '2px solid #E8D5B7', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600, color: '#5C3D2E' }}>✏️ Düzenle</button>
                    <button onClick={() => sil(brand)} style={{ background: '#FFEBEE', border: 'none', borderRadius: 8, padding: '5px 9px', fontSize: 13, cursor: 'pointer', color: '#C62828' }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
