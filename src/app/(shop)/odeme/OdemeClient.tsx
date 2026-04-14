'use client'

import { useCartStore } from '@/store/cartStore'
import { useState } from 'react'
import Link from 'next/link'

const FREE_SHIPPING = 1000
const SHIPPING_FEE = 49.90

export default function OdemeClient() {
  const { items, total } = useCartStore()
  const cartTotal = total()
  const shipping = cartTotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE
  const grandTotal = cartTotal + shipping

  const [iframeToken, setIframeToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', kvkk: false, mesafeli: false })

  const getToken = async () => {
    setLoading(true)
    setError('')
    const userIp = await fetch('https://api.ipify.org?format=json')
      .then((r) => r.json()).then((d) => d.ip).catch(() => '127.0.0.1')

    const res = await fetch('/api/paytr/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
        total: Math.round(grandTotal * 100) / 100,
        userIp,
        email: form.email,
        name: form.name,
        phone: form.phone,
        address: form.address,
      }),
    })

    const data = await res.json()
    setLoading(false)
    if (data.token) { setIframeToken(data.token) }
    else { setError(data.error || 'Ödeme başlatılamadı.') }
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <p className="text-xl font-extrabold text-gray-700 mb-4">Sepetiniz boş</p>
        <Link href="/" className="bg-orange-500 text-white font-extrabold px-6 py-3 rounded-xl">Alışverişe Başla</Link>
      </div>
    )
  }

  if (iframeToken) {
    return (
      <div className="bg-white rounded-2xl border border-orange-100 p-4">
        <iframe
          src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
          width="100%"
          height="600"
          frameBorder="0"
          style={{ border: 'none', borderRadius: '12px' }}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-orange-100 p-6">
        <h2 className="font-extrabold text-gray-800 mb-4">Teslimat Bilgileri</h2>
        <div className="space-y-4">
          {[
            { label: 'Ad Soyad', key: 'name', type: 'text', placeholder: 'Ad Soyad' },
            { label: 'E-posta', key: 'email', type: 'email', placeholder: 'ornek@email.com' },
            { label: 'Telefon', key: 'phone', type: 'tel', placeholder: '05xx xxx xx xx' },
          ].map((field) => (
            <div key={field.key}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px' }}>{field.label}</label>
              <input
                type={field.type}
                value={(form as any)[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#000', outline: 'none' }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px' }}>Adres</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Teslimat adresiniz"
              rows={3}
              style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#000', outline: 'none', resize: 'none' }}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-4">
          <h2 className="font-extrabold text-gray-800 mb-4">Sipariş Özeti</h2>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{item.name} x{item.quantity}</span>
                <span className="font-semibold whitespace-nowrap">₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ara Toplam</span>
              <span>₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Kargo</span>
              <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>{shipping === 0 ? 'Ücretsiz' : `₺${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-extrabold text-base pt-2 border-t border-gray-100">
              <span>Toplam</span>
              <span className="text-orange-500">₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <div className="bg-white rounded-2xl border border-orange-100 p-4 mb-4 space-y-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.kvkk}
              onChange={(e) => setForm({ ...form, kvkk: e.target.checked })}
              className="mt-0.5 accent-orange-500"
            />
            <span className="text-xs text-gray-600">
              <a href="/kvkk" target="_blank" className="text-orange-500 font-semibold hover:underline">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum.
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.mesafeli}
              onChange={(e) => setForm({ ...form, mesafeli: e.target.checked })}
              className="mt-0.5 accent-orange-500"
            />
            <span className="text-xs text-gray-600">
              <a href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-orange-500 font-semibold hover:underline">Mesafeli Satış Sözleşmesi</a>'ni okudum ve kabul ediyorum.
            </span>
          </label>
        </div>

        <button
          onClick={getToken}
          disabled={loading || !form.name || !form.email || !form.phone || !form.address || !form.kvkk || !form.mesafeli}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl text-base transition-colors"
        >
          {loading ? 'Hazırlanıyor...' : '🔒 Ödemeye Geç'}
        </button>
      </div>
    </div>
  )
}
