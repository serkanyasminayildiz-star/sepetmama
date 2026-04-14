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

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function KategorilerClient({ kategoriler }: { kategoriler: any[] }) {
  const router = useRouter()
  const [bildirim, setBildirim] = useState('')
  const [duzenle, setDuzenle] = useState<any>(null)
  const [yeni, setYeni] = useState({ name: '', slug: '', parentId: '' })

  const goster = (msg: string) => { setBildirim(msg); setTimeout(() => setBildirim(''), 3000) }

  const ekle = async () => {
    if (!yeni.name) { goster('⚠️ Kategori adı zorunludur!'); return }
    const res = await fetch('/api/admin/kategori', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: yeni.name, slug: yeni.slug || slugify(yeni.name), parentId: yeni.parentId || null }),
    })
    if (res.ok) { goster('✅ Kategori eklendi'); setYeni({ name: '', slug: '', parentId: '' }); router.refresh() }
    else goster('❌ Hata oluştu')
  }

  const guncelle = async () => {
    if (!duzenle) return
    const res = await fetch(`/api/admin/kategori/${duzenle.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: duzenle.name, slug: duzenle.slug, parentId: duzenle.parentId || null }),
    })
    if (res.ok) { goster('✅ Güncellendi'); setDuzenle(null); router.refresh() }
    else goster('❌ Hata oluştu')
  }

  const sil = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return
    const res = await fetch(`/api/admin/kategori/${id}`, { method: 'DELETE' })
    if (res.ok) { goster('✅ Kategori silindi'); router.refresh() }
    else goster('❌ Bu kategoriye bağlı ürünler var!')
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
          <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480 }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#5C3D2E', marginBottom: 20 }}>📁 Kategori Düzenle</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>Kategori Adı *</label>
              <input value={duzenle.name} onChange={e => setDuzenle({ ...duzenle, name: e.target.value })} style={s} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>Slug</label>
              <input value={duzenle.slug} onChange={e => setDuzenle({ ...duzenle, slug: e.target.value })} style={s} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#5C3D2E', opacity: 0.7, display: 'block', marginBottom: 5 }}>Üst Kategori</label>
              <select value={duzenle.parentId || ''} onChange={e => setDuzenle({ ...duzenle, parentId: e.target.value })} style={s}>
                <option value="">— Ana Kategori —</option>
                {kategoriler.filter(k => !k.parentId && k.id !== duzenle.id).map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={guncelle} style={{ ...btn(), flex: 1 }}>💾 Kaydet</button>
              <button onClick={() => setDuzenle(null)} style={btn('#888')}>İptal</button>
            </div>
          </div>
        </div>
      )}

      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: '#2C1A0E', marginBottom: 20 }}>
        Kategoriler <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.5 }}>({kategoriler.length})</span>
      </h1>

      {/* Yeni Kategori Formu */}
      <div style={{ background: 'white', borderRadius: 18, padding: 22, marginBottom: 16, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', border: '2px solid #E8845A' }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: '#2C1A0E', marginBottom: 14 }}>➕ Yeni Kategori</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D2E', opacity: 0.6, display: 'block', marginBottom: 4 }}>KATEGORİ ADI *</label>
            <input value={yeni.name} onChange={e => setYeni({ ...yeni, name: e.target.value, slug: slugify(e.target.value) })} style={s} placeholder="Örn: Kedi Maması" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D2E', opacity: 0.6, display: 'block', marginBottom: 4 }}>SLUG</label>
            <input value={yeni.slug} onChange={e => setYeni({ ...yeni, slug: e.target.value })} style={s} placeholder="kedi-mamasi" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D2E', opacity: 0.6, display: 'block', marginBottom: 4 }}>ÜST KATEGORİ</label>
            <select value={yeni.parentId} onChange={e => setYeni({ ...yeni, parentId: e.target.value })} style={s}>
              <option value="">— Ana Kategori —</option>
              {kategoriler.filter(k => !k.parentId).map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={ekle} style={btn()}>✅ Kategori Ekle</button>
      </div>

      {/* Liste */}
      <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAF5EF' }}>
              {['Kategori Adı', 'Slug', 'Üst Kategori', 'Alt Kategori', 'İşlem'].map(h => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5C3D2E', opacity: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kategoriler.map(k => (
              <tr key={k.id} style={{ borderBottom: '1px solid #F0E8E0' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FDFAF7'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                <td style={{ padding: '12px', fontSize: 14, fontWeight: 600, paddingLeft: k.parentId ? 28 : 12 }}>
                  {k.parentId ? <span style={{ opacity: 0.4, marginRight: 4 }}>└</span> : null}{k.name}
                </td>
                <td style={{ padding: '12px', fontSize: 12, opacity: 0.6, fontFamily: 'monospace' }}>{k.slug}</td>
                <td style={{ padding: '12px', fontSize: 12, opacity: 0.6 }}>{k.parent?.name || '—'}</td>
                <td style={{ padding: '12px', fontSize: 12, opacity: 0.6 }}>{k.children?.length || 0} alt</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setDuzenle({ ...k, parentId: k.parentId || '' })} style={{ background: '#FDF6EE', border: '2px solid #E8D5B7', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600, color: '#5C3D2E' }}>✏️ Düzenle</button>
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
