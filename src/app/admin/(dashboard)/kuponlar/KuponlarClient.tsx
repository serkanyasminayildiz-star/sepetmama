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

export default function KuponlarClient({ kuponlar }: { kuponlar: any[] }) {
  const router = useRouter()
  const [bildirim, setBildirim] = useState('')
  const [yeni, setYeni] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', usageLimit: '100', expiresAt: '' })

  const goster = (msg: string) => { setBildirim(msg); setTimeout(() => setBildirim(''), 3000) }

  const ekle = async () => {
    if (!yeni.code || !yeni.discountValue) { goster('⚠️ Kod ve indirim değeri zorunludur!'); return }
    const res = await fetch('/api/admin/kupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: yeni.code.toUpperCase(),
        discountType: yeni.discountType,
        discountValue: parseFloat(yeni.discountValue),
        minOrderAmount: parseFloat(yeni.minOrderAmount) || 0,
        usageLimit: parseInt(yeni.usageLimit) || 100,
        expiresAt: yeni.expiresAt || null,
      }),
    })
    if (res.ok) { goster('✅ Kupon oluşturuldu'); setYeni({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', usageLimit: '100', expiresAt: '' }); router.refresh() }
    else goster('❌ Hata oluştu')
  }

  const toggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/kupon/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive }) })
    router.refresh()
  }

  const sil = async (id: string) => {
    if (!confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/admin/kupon/${id}`, { method: 'DELETE' })
    goster('✅ Kupon silindi'); router.refresh()
  }

  return (
    <div>
      {bildirim && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: bildirim.startsWith('❌') || bildirim.startsWith('⚠️') ? '#C62828' : '#2C1A0E', color: 'white', padding: '14px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 9999 }}>
          {bildirim}
        </div>
      )}

      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: '#2C1A0E', marginBottom: 20 }}>Kupon Yönetimi</h1>

      {/* Yeni Kupon */}
      <div style={{ background: 'white', borderRadius: 18, padding: 22, marginBottom: 16, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', border: '2px solid #E8845A' }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: '#2C1A0E', marginBottom: 14 }}>➕ Yeni Kupon Oluştur</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D2E', opacity: 0.6, display: 'block', marginBottom: 4 }}>KOD *</label>
            <input value={yeni.code} onChange={e => setYeni({ ...yeni, code: e.target.value.toUpperCase() })} style={s} placeholder="INDIRIM20" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D2E', opacity: 0.6, display: 'block', marginBottom: 4 }}>İNDİRİM TİPİ</label>
            <select value={yeni.discountType} onChange={e => setYeni({ ...yeni, discountType: e.target.value })} style={s}>
              <option value="PERCENTAGE">Yüzde (%)</option>
              <option value="FIXED">Sabit TL</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D2E', opacity: 0.6, display: 'block', marginBottom: 4 }}>DEĞER *</label>
            <input type="number" value={yeni.discountValue} onChange={e => setYeni({ ...yeni, discountValue: e.target.value })} style={s} placeholder={yeni.discountType === 'PERCENTAGE' ? '20' : '50'} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D2E', opacity: 0.6, display: 'block', marginBottom: 4 }}>MİN. SEPET ₺</label>
            <input type="number" value={yeni.minOrderAmount} onChange={e => setYeni({ ...yeni, minOrderAmount: e.target.value })} style={s} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D2E', opacity: 0.6, display: 'block', marginBottom: 4 }}>KULLANIM LİMİTİ</label>
            <input type="number" value={yeni.usageLimit} onChange={e => setYeni({ ...yeni, usageLimit: e.target.value })} style={s} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D2E', opacity: 0.6, display: 'block', marginBottom: 4 }}>BİTİŞ TARİHİ</label>
            <input type="date" value={yeni.expiresAt} onChange={e => setYeni({ ...yeni, expiresAt: e.target.value })} style={s} />
          </div>
        </div>
        <button onClick={ekle} style={btn()}>Kupon Oluştur →</button>
      </div>

      {/* Liste */}
      <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAF5EF' }}>
              {['Kod', 'İndirim', 'Min Sepet', 'Kullanım', 'Bitiş', 'Durum', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5C3D2E', opacity: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kuponlar.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', opacity: 0.4 }}>Henüz kupon yok</td></tr>
            ) : kuponlar.map(k => (
              <tr key={k.id} style={{ borderBottom: '1px solid #F0E8E0' }}>
                <td style={{ padding: '12px', fontWeight: 700, color: '#E8845A', fontFamily: 'monospace', fontSize: 15 }}>{k.code}</td>
                <td style={{ padding: '12px', fontSize: 14, fontWeight: 700 }}>
                  {k.discountValue}{k.discountType === 'PERCENTAGE' ? '%' : '₺'}
                </td>
                <td style={{ padding: '12px', fontSize: 13 }}>₺{k.minOrderAmount || 0}</td>
                <td style={{ padding: '12px', fontSize: 13 }}>{k.usageCount || 0}/{k.usageLimit}</td>
                <td style={{ padding: '12px', fontSize: 12, opacity: 0.6 }}>
                  {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('tr-TR') : 'Süresiz'}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: k.isActive ? '#E8F5E9' : '#FFEBEE', color: k.isActive ? '#2E7D32' : '#C62828', padding: '3px 9px', borderRadius: 50, fontSize: 11, fontWeight: 700 }}>
                    {k.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => toggle(k.id, k.isActive)} style={{ background: '#FDF6EE', border: '2px solid #E8D5B7', borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', color: '#5C3D2E' }}>
                      {k.isActive ? 'Pasife Al' : 'Aktife Al'}
                    </button>
                    <button onClick={() => sil(k.id)} style={{ background: '#FFEBEE', border: 'none', borderRadius: 8, padding: '5px 9px', fontSize: 13, cursor: 'pointer', color: '#C62828' }}>🗑️</button>
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
