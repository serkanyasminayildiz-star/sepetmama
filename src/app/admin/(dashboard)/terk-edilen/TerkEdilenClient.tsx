'use client'

import { useMemo, useState } from 'react'

interface Cart {
  orderId: string
  name: string
  email: string
  isMember: boolean
  total: number
  createdAt: string
  attempts: number
  items: string[]
}

interface CouponLite {
  id: string
  code: string
  type: 'PERCENT' | 'FIXED'
  value: string
  minOrder: string | null
  firstOrderOnly: boolean
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', border: '2px solid #E8D5B7', borderRadius: 10,
  fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  background: 'white', color: '#2C1A0E',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function couponLabel(c: CouponLite) {
  const v = parseFloat(c.value)
  const base = c.type === 'PERCENT' ? `%${v}` : `₺${v}`
  const min = c.minOrder ? ` (min ₺${parseFloat(c.minOrder).toLocaleString('tr-TR')})` : ''
  const tag = c.firstOrderOnly ? ' • üye+ilk sipariş' : ''
  return `${c.code} — ${base} indirim${min}${tag}`
}

export default function TerkEdilenClient({ carts, coupons }: { carts: Cart[]; coupons: CouponLite[] }) {
  const [arama, setArama] = useState('')
  const [secili, setSecili] = useState<Set<string>>(new Set())
  const [couponCode, setCouponCode] = useState(coupons[0]?.code || '')
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [bildirim, setBildirim] = useState('')

  const goster = (msg: string) => { setBildirim(msg); setTimeout(() => setBildirim(''), 4000) }

  const seciliKupon = coupons.find((c) => c.code === couponCode)

  const filtreli = useMemo(() => {
    const q = arama.trim().toLowerCase()
    if (!q) return carts
    return carts.filter((c) =>
      (c.name || '').toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    )
  }, [arama, carts])

  const tumuSeciliMi = filtreli.length > 0 && filtreli.every((c) => secili.has(c.orderId))

  const tumunuToggle = () => {
    setSecili((prev) => {
      const next = new Set(prev)
      if (tumuSeciliMi) filtreli.forEach((c) => next.delete(c.orderId))
      else filtreli.forEach((c) => next.add(c.orderId))
      return next
    })
  }

  const satirToggle = (id: string) => {
    setSecili((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const gonder = async () => {
    if (secili.size === 0) { goster('❌ Önce sepet seçin'); return }
    if (!couponCode) { goster('❌ Kupon seçin'); return }
    if (!confirm(`${secili.size} müşteriye "${couponCode}" kuponlu hatırlatma e-postası gönderilecek. Onaylıyor musun?`)) return

    setGonderiliyor(true)
    try {
      const res = await fetch('/api/admin/sepet-kurtar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(secili), couponCode }),
      })
      const data = await res.json()
      if (res.ok) {
        goster(`✅ ${data.sent} gönderildi${data.failed > 0 ? `, ${data.failed} başarısız` : ''}`)
        setSecili(new Set())
      } else {
        goster('❌ ' + (data.error || 'Gönderilemedi'))
      }
    } catch {
      goster('❌ Bağlantı hatası')
    } finally {
      setGonderiliyor(false)
    }
  }

  // Misafir seçili mi (firstOrderOnly kupon uyarısı için)
  const seciliMisafirVar = filtreli.some((c) => secili.has(c.orderId) && !c.isMember)

  return (
    <div>
      {bildirim && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: bildirim.startsWith('❌') ? '#C62828' : '#2C1A0E', color: 'white', padding: '14px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 9999 }}>
          {bildirim}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: '#2C1A0E' }}>
          Terk Edilen Sepetler <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.5 }}>{carts.length} müşteri</span>
        </h1>
      </div>
      <p style={{ fontSize: 12, color: '#5C3D2E', opacity: 0.6, marginBottom: 16 }}>
        Ödemesini tamamlamamış müşteriler (üye + misafir). Satın almış olanlar listelenmez.
      </p>

      {/* Gönderme çubuğu */}
      <div style={{ background: 'white', borderRadius: 18, padding: '14px 18px', marginBottom: 12, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 İsim veya e-posta ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 220, padding: '9px 14px' }}
        />
        {coupons.length === 0 ? (
          <span style={{ fontSize: 13, color: '#C62828' }}>Aktif kupon yok — önce Kuponlar&apos;dan oluştur</span>
        ) : (
          <>
            <select value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 260 }}>
              {coupons.map((c) => <option key={c.id} value={c.code}>{couponLabel(c)}</option>)}
            </select>
            <button
              onClick={gonder}
              disabled={gonderiliyor || secili.size === 0}
              style={{ background: secili.size === 0 || gonderiliyor ? '#C9B79C' : '#F2B33D', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: secili.size === 0 || gonderiliyor ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            >
              {gonderiliyor ? 'Gönderiliyor...' : `✉️ Hatırlatma Gönder (${secili.size})`}
            </button>
          </>
        )}
      </div>

      {seciliKupon?.firstOrderOnly && seciliMisafirVar && (
        <div style={{ background: '#FFF4E5', border: '1px solid #E9C878', borderRadius: 12, padding: '10px 16px', marginBottom: 12, fontSize: 12.5, color: '#8A4B1E' }}>
          ⚠️ Seçtiğin kupon &quot;üye + ilk sipariş&quot; şartlı. Seçili misafir müşteriler bunu kullanamaz — onlar için genel bir kupon (ör. TEKRAR15) seç.
        </div>
      )}

      {/* Tablo */}
      <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAF5EF' }}>
                <th style={{ padding: '12px', textAlign: 'left', width: 40 }}>
                  <input type="checkbox" checked={tumuSeciliMi} onChange={tumunuToggle} style={{ cursor: 'pointer', accentColor: '#F2B33D' }} />
                </th>
                {['MÜŞTERİ', 'E-POSTA', 'SEPET', 'TUTAR', 'DENEME', 'TARİH'].map((h) => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5C3D2E', opacity: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtreli.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9C8470' }}>🎉 Terk edilen sepet yok</td></tr>
              ) : filtreli.map((c) => (
                <tr key={c.orderId} style={{ borderBottom: '1px solid #F5EFE8', background: secili.has(c.orderId) ? '#F6F3E9' : 'white' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <input type="checkbox" checked={secili.has(c.orderId)} onChange={() => satirToggle(c.orderId)} style={{ cursor: 'pointer', accentColor: '#F2B33D' }} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#2C1A0E' }}>{c.name || '—'}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: c.isMember ? '#2E7D32' : '#9C8470' }}>
                      {c.isMember ? '● ÜYE' : '○ Misafir'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#5C3D2E' }}>{c.email}</td>
                  <td style={{ padding: '10px 12px', color: '#5C3D2E', opacity: 0.8, maxWidth: 280, fontSize: 12 }}>{c.items.join(', ')}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#5C3D2E', whiteSpace: 'nowrap' }}>₺{c.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: '#EDF1EB', color: '#5C3D2E', padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700 }}>{c.attempts}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#5C3D2E', opacity: 0.75, whiteSpace: 'nowrap' }}>{fmtDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 11, color: '#5C3D2E', opacity: 0.45, textAlign: 'center' }}>
        💡 Misafirlerin de kullanabilmesi için genel (üyelik şartsız) bir kupon seçin. Test için kendi adresine gönderebilirsin.
      </div>
    </div>
  )
}
