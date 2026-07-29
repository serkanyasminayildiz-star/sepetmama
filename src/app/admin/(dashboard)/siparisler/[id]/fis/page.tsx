import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import PrintButton from './PrintButton'

export default async function FisPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/giris')

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      total: true,
      shippingFee: true,
      createdAt: true,
      paidAt: true,
      shippingFullName: true,
      shippingEmail: true,
      shippingPhone: true,
      shippingAddress: true,
      cargoCompany: true,
      cargoTrackingNo: true,
      consents: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: { select: { name: true, sku: true } },
        },
      },
    },
  })

  if (!order) notFound()

  const total = parseFloat(order.total.toString())
  const shipping = parseFloat(order.shippingFee.toString())
  const subtotal = total - shipping
  const consents = order.consents as { kvkk?: boolean; mesafeli?: boolean; acceptedAt?: string; ip?: string } | null

  return (
    <>
      {/* Print CSS: sadece .invoice görünür, admin sidebar/header/no-print gizli */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .fis-wrapper, .fis-wrapper * { visibility: visible !important; }
          .fis-wrapper { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
          @page { margin: 1.2cm; size: A4; }
        }
        @media screen {
          .fis-wrapper { max-width: 800px; margin: 24px auto; }
        }
      `}</style>

      <div className="no-print" style={{ maxWidth: 800, margin: '0 auto', padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/admin/siparisler" style={{ color: '#5C3D2E', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Siparişler</a>
        <PrintButton />
      </div>

      <div className="fis-wrapper" style={{ background: 'white', borderRadius: 12, padding: '40px 48px', boxShadow: '0 4px 24px rgba(92,61,46,0.08)', fontFamily: '-apple-system, system-ui, sans-serif', color: '#1a1a1a', fontSize: 13, lineHeight: 1.5 }}>
        {/* Üst — Logo + sipariş info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 20, borderBottom: '2px solid #E8845A', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
              <span style={{ color: '#f97316' }}>se</span>
              <span style={{ color: '#2563eb' }}>Pet</span>
              <span style={{ color: '#f97316' }}>Mama</span>
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>www.sepetmama.com · info@sepetmama.com</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 }}>Paketleme Fişi</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, marginTop: 4 }}>#{order.id.slice(-8).toUpperCase()}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
              {new Date(order.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Müşteri + Teslimat adresi */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Müşteri</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{order.shippingFullName || '—'}</div>
            <div style={{ fontSize: 12, color: '#555' }}>📞 {order.shippingPhone || '—'}</div>
            <div style={{ fontSize: 12, color: '#555' }}>✉ {order.shippingEmail || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Teslimat Adresi</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{order.shippingAddress || '—'}</div>
          </div>
        </div>

        {/* Kargo bilgisi (varsa) */}
        {(order.cargoCompany || order.cargoTrackingNo) && (
          <div style={{ background: '#F3E5F5', borderRadius: 8, padding: '10px 14px', marginBottom: 24, fontSize: 12 }}>
            <strong style={{ color: '#6A1B9A' }}>🚚 Kargo:</strong>
            {order.cargoCompany && <span style={{ marginLeft: 8 }}>{order.cargoCompany}</span>}
            {order.cargoTrackingNo && <span style={{ marginLeft: 8, fontFamily: 'monospace', fontWeight: 700 }}>{order.cargoTrackingNo}</span>}
          </div>
        )}

        {/* Ürün tablosu */}
        <div style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Sipariş İçeriği</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E8845A' }}>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Ürün</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', width: 100 }}>SKU</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', width: 60 }}>Adet</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', width: 100 }}>Birim</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', width: 100 }}>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => {
              const unitPrice = parseFloat(item.price.toString())
              const lineTotal = unitPrice * item.quantity
              return (
                <tr key={item.id} style={{ borderBottom: '1px dashed #ddd' }}>
                  <td style={{ padding: '10px 8px', fontSize: 12 }}>{item.product?.name || 'Ürün'}</td>
                  <td style={{ padding: '10px 8px', fontSize: 11, color: '#888', fontFamily: 'monospace' }}>{item.product?.sku || '—'}</td>
                  <td style={{ padding: '10px 8px', fontSize: 12, textAlign: 'right', fontWeight: 700 }}>{item.quantity}</td>
                  <td style={{ padding: '10px 8px', fontSize: 12, textAlign: 'right' }}>₺{unitPrice.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', fontSize: 12, textAlign: 'right', fontWeight: 700 }}>₺{lineTotal.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Toplam */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 280, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#666' }}>Ara Toplam</span>
              <span>₺{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#666' }}>Kargo</span>
              <span style={{ color: shipping === 0 ? '#2E7D32' : '#1a1a1a' }}>
                {shipping === 0 ? 'Ücretsiz' : `₺${shipping.toFixed(2)}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #E8845A', marginTop: 4, fontSize: 16, fontWeight: 700 }}>
              <span>Toplam</span>
              <span style={{ color: '#E8845A' }}>₺{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* KVKK + Mesafeli onay snapshot */}
        {consents && (consents.kvkk || consents.mesafeli) && (
          <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #ddd', fontSize: 10, color: '#888' }}>
            <strong>Onay kaydı:</strong>
            {consents.kvkk && <span style={{ marginLeft: 8 }}>✓ KVKK</span>}
            {consents.mesafeli && <span style={{ marginLeft: 8 }}>✓ Mesafeli Satış Sözleşmesi</span>}
            {consents.acceptedAt && <span style={{ marginLeft: 8 }}>{new Date(consents.acceptedAt).toLocaleString('tr-TR')}</span>}
            {consents.ip && <span style={{ marginLeft: 8 }}>IP: {consents.ip}</span>}
          </div>
        )}

        {/* Alt yazı */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #ddd', textAlign: 'center', fontSize: 11, color: '#888', lineHeight: 1.6 }}>
          Bizi tercih ettiğiniz için teşekkür ederiz! 🐾
          <br />
          Herhangi bir sorunuz olursa <strong>info@sepetmama.com</strong> adresinden bize ulaşabilirsiniz.
        </div>
      </div>
    </>
  )
}
