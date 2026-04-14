'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuler = [
  { id: 'dashboard', icon: '📊', ad: 'Dashboard', href: '/admin' },
  { id: 'urunler', icon: '📦', ad: 'Ürünler', href: '/admin/urunler' },
  { id: 'stok', icon: '📉', ad: 'Stok Takibi', href: '/admin/stok' },
  { id: 'siparisler', icon: '🛒', ad: 'Siparişler', href: '/admin/siparisler' },
  { id: 'kategoriler', icon: '📁', ad: 'Kategoriler', href: '/admin/kategoriler' },
  { id: 'markalar', icon: '🏷️', ad: 'Markalar', href: '/admin/markalar' },
  { id: 'kuponlar', icon: '🎟️', ad: 'Kuponlar', href: '/admin/kuponlar' },
  { id: 'kargo', icon: '🚚', ad: 'Kargo Ayarları', href: '/admin/kargo' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ minHeight: '100vh', background: '#F0EBE3', fontFamily: 'sans-serif', display: 'flex' }}>
      {/* Sol Menü */}
      <div style={{ width: 220, background: '#1C0F06', minHeight: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, overflowY: 'auto', zIndex: 100 }}>
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#FDF6EE' }}>
            se<span style={{ color: '#E8845A' }}>Pet</span>Mama
          </div>
          <div style={{ fontSize: 10, color: '#F4C09A', opacity: 0.5, marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 }}>Yönetim Paneli</div>
        </div>
        <nav style={{ padding: '10px 8px' }}>
          {menuler.map((m) => {
            const aktif = pathname === m.href || (m.href !== '/admin' && pathname.startsWith(m.href))
            return (
              <Link key={m.id} href={m.href} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '10px 14px',
                background: aktif ? 'rgba(232,132,90,0.18)' : 'none',
                borderLeft: aktif ? '3px solid #E8845A' : '3px solid transparent',
                color: aktif ? '#E8845A' : '#FDF6EE',
                fontSize: 13, fontWeight: aktif ? 700 : 400,
                marginBottom: 1, opacity: aktif ? 1 : 0.6,
                textDecoration: 'none',
              }}>
                <span style={{ fontSize: 15 }}>{m.icon}</span>
                {m.ad}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '8px', marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, color: '#FDF6EE', textDecoration: 'none', fontSize: 13, opacity: 0.5 }}>
            🏠 Siteye Git
          </Link>
        </div>
      </div>

      {/* Ana İçerik */}
      <div style={{ marginLeft: 220, flex: 1, padding: '28px 28px 60px', minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
