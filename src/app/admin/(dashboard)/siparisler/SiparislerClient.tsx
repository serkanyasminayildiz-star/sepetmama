'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getStatusMeta, ORDER_STATUS } from '@/lib/order-status'

const btn = (bg = '#E8845A', extra?: React.CSSProperties): React.CSSProperties => ({
  background: bg, color: 'white', border: 'none', borderRadius: 10,
  padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  fontFamily: 'inherit', whiteSpace: 'nowrap', ...extra,
})

export default function SiparislerClient({ orders, searchParams }: any) {
  const router = useRouter()
  const [acikId, setAcikId] = useState<string | null>(null)
  const [bildirim, setBildirim] = useState('')
  const [kargoNo, setKargoNo] = useState<Record<string, string>>({})

  const goster = (msg: string) => { setBildirim(msg); setTimeout(() => setBildirim(''), 3000) }

  const durumGuncelle = async (id: string, status: string) => {
    await fetch(`/api/admin/siparis/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    goster('✅ Durum güncellendi')
    router.refresh()
  }

  const kargoGuncelle = async (id: string) => {
    await fetch(`/api/admin/siparis/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cargoTrackingNo: kargoNo[id] }),
    })
    goster('✅ Kargo no kaydedildi')
    router.refresh()
  }

  const filtrele = (durum: string) => {
    const params = new URLSearchParams()
    if (durum) params.set('durum', durum)
    router.push(`/admin/siparisler?${params.toString()}`)
  }

  return (
    <div>
      {bildirim && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: bildirim.startsWith('❌') ? '#C62828' : '#2C1A0E', color: 'white', padding: '14px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 9999 }}>
          {bildirim}
        </div>
      )}

      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: '#2C1A0E', marginBottom: 20 }}>
        Sipariş Yönetimi <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.5 }}>{orders.length} sipariş</span>
      </h1>

      {/* Durum filtreleri */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['', 'Tümü'],
          ...(Object.entries(ORDER_STATUS).map(([k, v]) => [k, `${v.emoji} ${v.label}`])),
        ].map(([val, lbl]) => (
          <button key={val} onClick={() => filtrele(val)}
            style={{ ...btn(searchParams.durum === val || (!searchParams.durum && val === '') ? '#E8845A' : '#E8D5B7'), color: searchParams.durum === val || (!searchParams.durum && val === '') ? 'white' : '#5C3D2E', padding: '8px 16px', fontSize: 12 }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Sipariş listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {orders.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 18, padding: '60px 0', textAlign: 'center', opacity: 0.4 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16 }}>Bu durumda sipariş yok</div>
          </div>
        ) : orders.map((sp: any) => (
          <div key={sp.id} style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', overflow: 'hidden' }}>
            {/* Sipariş başlık */}
            <div style={{ padding: '14px 20px', background: '#FAF5EF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: '#5C3D2E' }}>#{sp.id.slice(-8).toUpperCase()}</span>
                <span style={{ fontSize: 12, opacity: 0.5 }}>{new Date(sp.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                {(() => {
                  const m = getStatusMeta(sp.status)
                  return (
                    <span style={{ background: m.bg, color: m.color, padding: '2px 9px', borderRadius: 50, fontSize: 11, fontWeight: 700 }}>
                      {m.emoji} {m.label}
                    </span>
                  )
                })()}
                {sp.paidAt ? (
                  <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '2px 9px', borderRadius: 50, fontSize: 11, fontWeight: 700 }}>
                    💰 Ödendi
                  </span>
                ) : (
                  <span style={{ background: '#FFF3E0', color: '#E65100', padding: '2px 9px', borderRadius: 50, fontSize: 11, fontWeight: 700 }}>
                    💳 Ödeme bekleniyor
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: '#E8845A' }}>₺{parseFloat(sp.total).toFixed(2)}</span>
                <Link href={`/admin/siparisler/${sp.id}/fis`} target="_blank" style={{ background: '#FDF6EE', border: '2px solid #E8D5B7', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#5C3D2E', fontWeight: 600, textDecoration: 'none' }}>
                  🖨️ Fiş
                </Link>
                <button onClick={() => setAcikId(acikId === sp.id ? null : sp.id)}
                  style={{ background: 'none', border: '2px solid #E8D5B7', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: '#5C3D2E', fontWeight: 600 }}>
                  {acikId === sp.id ? '▲ Kapat' : '▼ Detay'}
                </button>
              </div>
            </div>

            {/* Sipariş detay */}
            {acikId === sp.id && (
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {/* Müşteri */}
                  <div style={{ background: '#FDF6EE', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Müşteri</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{sp.shippingFullName || sp.user?.name || '—'}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{sp.shippingEmail || sp.user?.email || '—'}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{sp.shippingPhone || sp.user?.phone || '—'}</div>
                    {!sp.user && <div style={{ fontSize: 10, marginTop: 4, color: '#E65100', fontWeight: 600 }}>👤 Misafir sipariş</div>}
                  </div>
                  {/* Adres */}
                  <div style={{ background: '#FDF6EE', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Teslimat Adresi</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{sp.shippingAddress || sp.address?.address || '—'}</div>
                    {sp.address?.district && <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{sp.address.district} / {sp.address.city}</div>}
                  </div>
                  {/* Kargo takip */}
                  <div style={{ background: '#FDF6EE', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Kargo Takip No</div>
                    <input
                      type="text"
                      placeholder="Takip numarası..."
                      defaultValue={sp.cargoTrackingNo || ''}
                      onChange={e => setKargoNo({ ...kargoNo, [sp.id]: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '2px solid #E8D5B7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white', color: '#000', marginBottom: 6 }}
                    />
                    <button onClick={() => kargoGuncelle(sp.id)} style={{ ...btn(), padding: '6px 14px', fontSize: 12 }}>Kaydet</button>
                  </div>
                </div>

                {/* KVKK + mesafeli onay snapshot */}
                {sp.consents && (
                  <div style={{ background: '#F0F8E8', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 11, color: '#2E7D32', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {sp.consents.kvkk && <span>✓ KVKK kabul edildi</span>}
                    {sp.consents.mesafeli && <span>✓ Mesafeli Satış Sözleşmesi kabul edildi</span>}
                    {sp.consents.acceptedAt && <span style={{ opacity: 0.6 }}>{new Date(sp.consents.acceptedAt).toLocaleString('tr-TR')}</span>}
                    {sp.consents.ip && <span style={{ opacity: 0.6 }}>IP: {sp.consents.ip}</span>}
                  </div>
                )}

                {/* Hata mesajı (failed payment) */}
                {sp.failedReason && (
                  <div style={{ background: '#FFEBEE', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#C62828' }}>
                    ⚠ Hata: {sp.failedReason}
                  </div>
                )}

                {/* Sipariş ürünleri */}
                <div style={{ background: '#F8F4F0', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>Sipariş İçeriği</div>
                  {sp.items.map((item: any, i: number) => {
                    const image = item.product?.images?.[0]?.url
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < sp.items.length - 1 ? '1px dashed #E8D5B7' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 48, height: 48, background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                            {image ? <Image src={image} alt={item.product?.name || ''} fill style={{ objectFit: 'contain', padding: 4 }} sizes="48px" /> : <span style={{ fontSize: 20 }}>🐾</span>}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#2C1A0E' }}>{item.product?.name || 'Ürün'}</div>
                            <div style={{ fontSize: 11, opacity: 0.5 }}>x{item.quantity} adet · Birim: ₺{parseFloat(item.price).toFixed(2)}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#5C3D2E', fontSize: 14 }}>
                          ₺{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, paddingTop: 10, borderTop: '2px solid #E8D5B7' }}>
                    <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#E8845A' }}>
                      Toplam: ₺{parseFloat(sp.total).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Durum güncelleme */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <select
                    defaultValue={sp.status}
                    onChange={e => durumGuncelle(sp.id, e.target.value)}
                    style={{ padding: '9px 14px', border: '2px solid #E8D5B7', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: 'white', color: '#2C1A0E', cursor: 'pointer' }}>
                    <option value="PENDING">⏳ Beklemede</option>
                    <option value="CONFIRMED">✅ Onaylandı</option>
                    <option value="SHIPPED">🚚 Kargoda</option>
                    <option value="DELIVERED">📦 Teslim Edildi</option>
                    <option value="CANCELLED">❌ İptal</option>
                    <option value="REFUNDED">↩️ İade</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
