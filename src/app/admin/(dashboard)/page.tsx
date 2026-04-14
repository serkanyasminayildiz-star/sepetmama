import { prisma } from '@/lib/prisma'
import AdminShell from './AdminShell'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [
    totalProducts,
    totalOrders,
    pendingOrders,
    totalCategories,
    outOfStock,
    criticalStock,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.category.count(),
    prisma.product.count({ where: { stock: 0, isActive: true } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: 5 }, isActive: true } }),
  ])

  const cards = [
    { icon: '📦', ad: 'Toplam Ürün', deger: totalProducts, renk: '#E8845A', href: '/admin/urunler' },
    { icon: '🛒', ad: 'Toplam Sipariş', deger: totalOrders, renk: '#8BAF8E', href: '/admin/siparisler' },
    { icon: '⏳', ad: 'Bekleyen Sipariş', deger: pendingOrders, renk: '#E65100', href: '/admin/siparisler' },
    { icon: '📁', ad: 'Toplam Kategori', deger: totalCategories, renk: '#5C3D2E', href: '/admin/kategoriler' },
  ]

  return (
    <AdminShell>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 700, color: '#2C1A0E', marginBottom: 24 }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        {cards.map((k) => (
          <Link key={k.ad} href={k.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 18, padding: 20, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', cursor: 'pointer' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{k.icon}</div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 32, fontWeight: 700, color: k.renk }}>{k.deger}</div>
              <div style={{ fontSize: 12, color: '#5C3D2E', opacity: 0.5, marginTop: 4 }}>{k.ad}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Stok Uyarıları */}
        <div style={{ background: 'white', borderRadius: 18, padding: 22, boxShadow: '0 4px 16px rgba(92,61,46,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: '#2C1A0E', margin: 0 }}>📉 Stok Uyarıları</h3>
            <Link href="/admin/stok" style={{ background: '#FDF6EE', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: '#E8845A', fontWeight: 700, textDecoration: 'none' }}>Tümü →</Link>
          </div>
          {[
            { label: 'Stok Tükendi', deger: outOfStock, renk: '#C62828', bg: '#FFEBEE' },
            { label: 'Kritik Stok (1–5)', deger: criticalStock, renk: '#E65100', bg: '#FFF3E0' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: item.bg, borderRadius: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: item.renk, fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: item.renk }}>{item.deger}</span>
            </div>
          ))}
        </div>

        {/* Hızlı Erişim */}
        <div style={{ background: 'white', borderRadius: 18, padding: 22, boxShadow: '0 4px 16px rgba(92,61,46,0.06)' }}>
          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: '#2C1A0E', marginBottom: 16 }}>⚡ Hızlı Erişim</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: '📦 Ürünler', href: '/admin/urunler' },
              { label: '🛒 Siparişler', href: '/admin/siparisler' },
              { label: '📉 Stok', href: '/admin/stok' },
              { label: '📁 Kategoriler', href: '/admin/kategoriler' },
              { label: '🏷️ Markalar', href: '/admin/markalar' },
              { label: '🎟️ Kuponlar', href: '/admin/kuponlar' },
              { label: '🚚 Kargo', href: '/admin/kargo' },
            ].map((m) => (
              <Link key={m.href} href={m.href} style={{ background: '#FDF6EE', border: '2px solid #E8D5B7', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: '#5C3D2E', cursor: 'pointer', textDecoration: 'none' }}>
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
