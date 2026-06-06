'use client'

import { useMemo, useState } from 'react'

interface Member {
  id: string
  name: string | null
  email: string
  phone: string | null
  createdAt: string
  orderCount: number
  totalSpent: number
}

interface CouponLite {
  id: string
  code: string
  type: 'PERCENT' | 'FIXED'
  value: string
  minOrder: string | null
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
  return `${c.code} — ${base} indirim${min}`
}

export default function UyelerClient({ members, coupons }: { members: Member[]; coupons: CouponLite[] }) {
  const [arama, setArama] = useState('')
  const [secili, setSecili] = useState<Set<string>>(new Set())
  const [couponCode, setCouponCode] = useState(coupons[0]?.code || '')
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [bildirim, setBildirim] = useState('')

  const goster = (msg: string) => { setBildirim(msg); setTimeout(() => setBildirim(''), 4000) }

  const filtreli = useMemo(() => {
    const q = arama.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) =>
      (m.name || '').toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone || '').toLowerCase().includes(q)
    )
  }, [arama, members])

  const tumuSeciliMi = filtreli.length > 0 && filtreli.every((m) => secili.has(m.id))

  const tumunuToggle = () => {
    setSecili((prev) => {
      const next = new Set(prev)
      if (tumuSeciliMi) {
        filtreli.forEach((m) => next.delete(m.id))
      } else {
        filtreli.forEach((m) => next.add(m.id))
      }
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

  const kuponGonder = async () => {
    if (secili.size === 0) { goster('❌ Önce üye seçin'); return }
    if (!couponCode) { goster('❌ Kupon seçin'); return }
    if (!confirm(`${secili.size} üyeye "${couponCode}" kuponu e-posta ile gönderilecek. Onaylıyor musun?`)) return

    setGonderiliyor(true)
    try {
      const res = await fetch('/api/admin/kupon-gonder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from(secili), couponCode }),
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

  return (
    <div>
      {bildirim && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: bildirim.startsWith('❌') ? '#C62828' : '#2C1A0E', color: 'white', padding: '14px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 9999 }}>
          {bildirim}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: '#2C1A0E' }}>
          Üyeler <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.5 }}>{members.length} üye</span>
        </h1>
      </div>

      {/* Kupon gönderme çubuğu */}
      <div style={{ background: 'white', borderRadius: 18, padding: '14px 18px', marginBottom: 12, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 İsim, e-posta veya telefon ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 220, padding: '9px 14px' }}
        />
        {coupons.length === 0 ? (
          <span style={{ fontSize: 13, color: '#C62828' }}>Aktif kupon yok — önce Kuponlar&apos;dan oluştur</span>
        ) : (
          <>
            <select value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 220 }}>
              {coupons.map((c) => <option key={c.id} value={c.code}>{couponLabel(c)}</option>)}
            </select>
            <button
              onClick={kuponGonder}
              disabled={gonderiliyor || secili.size === 0}
              style={{ background: secili.size === 0 || gonderiliyor ? '#C9B79C' : '#E8845A', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: secili.size === 0 || gonderiliyor ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            >
              {gonderiliyor ? 'Gönderiliyor...' : `✉️ Kupon Gönder (${secili.size})`}
            </button>
          </>
        )}
      </div>

      {/* Tablo */}
      <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAF5EF' }}>
                <th style={{ padding: '12px', textAlign: 'left', width: 40 }}>
                  <input type="checkbox" checked={tumuSeciliMi} onChange={tumunuToggle} style={{ cursor: 'pointer', accentColor: '#E8845A' }} />
                </th>
                {['ÜYE', 'E-POSTA', 'TELEFON', 'KAYIT', 'SİPARİŞ', 'HARCAMA'].map((h) => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5C3D2E', opacity: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtreli.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9C8470' }}>Üye bulunamadı</td></tr>
              ) : filtreli.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #F5EFE8', background: secili.has(m.id) ? '#FDF6EE' : 'white' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <input type="checkbox" checked={secili.has(m.id)} onChange={() => satirToggle(m.id)} style={{ cursor: 'pointer', accentColor: '#E8845A' }} />
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#2C1A0E' }}>{m.name || '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#5C3D2E' }}>{m.email}</td>
                  <td style={{ padding: '10px 12px', color: '#5C3D2E', opacity: 0.75 }}>{m.phone || '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#5C3D2E', opacity: 0.75 }}>{fmtDate(m.createdAt)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: m.orderCount > 0 ? '#E8F5E9' : '#F0EBE3', color: m.orderCount > 0 ? '#2E7D32' : '#9C8470', padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700 }}>
                      {m.orderCount}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#5C3D2E' }}>
                    {m.totalSpent > 0 ? `₺${m.totalSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 11, color: '#5C3D2E', opacity: 0.45, textAlign: 'center' }}>
        💡 Üyeleri seçip aktif bir kuponu e-posta ile gönderebilirsiniz. Kuponlar Kuponlar sayfasından oluşturulur.
      </div>
    </div>
  )
}
