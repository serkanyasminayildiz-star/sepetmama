'use client'

import { useCartStore } from '@/store/cartStore'
import { useCoupon } from '@/hooks/useCoupon'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FREE_SHIPPING = 1000
const SHIPPING_FEE = 49.90

// Online kart ödemesi geçici olarak kapalı (PayTR hesabı kapandı).
// Yeni sağlayıcı entegre edilince true yapılacak — kapıda ödeme her durumda açık.
const ONLINE_PAYMENT_ENABLED = false

type PaymentChoice = 'kapida' | 'online'

export default function OdemeClient() {
  const { items, total, clearCart } = useCartStore()
  const router = useRouter()
  const cartTotal = total()
  const shipping = cartTotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE

  const [iframeToken, setIframeToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [payment, setPayment] = useState<PaymentChoice>(ONLINE_PAYMENT_ENABLED ? 'online' : 'kapida')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', kvkk: false, mesafeli: false })

  // Kupon — sepetten taşınan kod dahil tek kaynaktan
  const { couponCode, discount, error: couponError, loading: couponLoading, apply: applyCoupon, remove: removeCoupon } = useCoupon(cartTotal)
  const [couponInput, setCouponInput] = useState('')

  const handleApplyCoupon = async () => {
    const ok = await applyCoupon(couponInput)
    if (ok) setCouponInput('')
  }
  const grandTotal = Math.max(0, cartTotal - discount + shipping)

  const getToken = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/paytr/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        shipping: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
        },
        consents: {
          kvkk: form.kvkk,
          mesafeli: form.mesafeli,
        },
        couponCode: couponCode || undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)
    if (data.token) { setIframeToken(data.token) }
    else { setError(data.error || 'Ödeme başlatılamadı.') }
  }

  const kapidaSiparis = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/order/kapida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          shipping: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
          },
          consents: { kvkk: form.kvkk, mesafeli: form.mesafeli },
          couponCode: couponCode || undefined,
        }),
      })
      const data = await res.json()
      if (data.orderId) {
        clearCart()
        router.push(`/odeme/basarili?orderId=${data.orderId}&kapida=1`)
        return
      }
      setError(data.error || 'Sipariş oluşturulamadı.')
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    }
    setLoading(false)
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
          {([
            { label: 'Ad Soyad', key: 'name', type: 'text', placeholder: 'Ad Soyad' },
            { label: 'E-posta', key: 'email', type: 'email', placeholder: 'ornek@email.com' },
            { label: 'Telefon', key: 'phone', type: 'tel', placeholder: '05xx xxx xx xx' },
          ] as const).map((field) => (
            <div key={field.key}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px' }}>{field.label}</label>
              <input
                type={field.type}
                value={form[field.key] as string}
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
          {/* Kupon */}
          <div className="border-t border-gray-100 pt-3 mb-1">
            {discount > 0 ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <span className="text-sm font-semibold text-green-700">
                  🎉 <span className="font-extrabold">{couponCode}</span> uygulandı
                </span>
                <button onClick={removeCoupon} className="text-xs text-green-700 font-semibold hover:underline">
                  Kaldır
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon() }}
                    placeholder="İndirim kodu"
                    style={{ flex: 1, border: '1.5px solid #d1d5db', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#000', outline: 'none', textTransform: 'uppercase' }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="bg-gray-800 hover:bg-gray-900 disabled:opacity-40 text-white font-bold px-4 rounded-xl text-sm whitespace-nowrap transition-colors"
                  >
                    {couponLoading ? '...' : 'Uygula'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {couponError}
                    {couponError.includes('üye') && (
                      <>
                        {' '}
                        <Link href="/giris" className="text-orange-500 font-semibold underline">Giriş yap</Link>
                        {' / '}
                        <Link href="/kayit" className="text-orange-500 font-semibold underline">Üye ol</Link>
                      </>
                    )}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ara Toplam</span>
              <span>₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-semibold">
                  {`İndirim (${couponCode})`}
                </span>
                <span className="text-green-600 font-semibold">-₺{discount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
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

        {/* Ödeme yöntemi */}
        <div className="bg-white rounded-2xl border border-orange-100 p-4 mb-4">
          <h2 className="font-extrabold text-gray-800 mb-3 text-sm">Ödeme Yöntemi</h2>
          <div className="space-y-2">
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                payment === 'kapida' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
              }`}
            >
              <input
                type="radio"
                name="odeme"
                checked={payment === 'kapida'}
                onChange={() => setPayment('kapida')}
                className="mt-0.5 accent-orange-500"
              />
              <span>
                <span className="block text-sm font-extrabold text-gray-800">💵 Kapıda Ödeme</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Ürünü teslim alırken kuryeye nakit veya kartla ödeyin.
                </span>
              </span>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-colors ${
                !ONLINE_PAYMENT_ENABLED
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70'
                  : payment === 'online'
                    ? 'border-orange-500 bg-orange-50 cursor-pointer'
                    : 'border-gray-200 hover:border-orange-200 cursor-pointer'
              }`}
            >
              <input
                type="radio"
                name="odeme"
                disabled={!ONLINE_PAYMENT_ENABLED}
                checked={payment === 'online'}
                onChange={() => setPayment('online')}
                className="mt-0.5 accent-orange-500"
              />
              <span>
                <span className="block text-sm font-extrabold text-gray-800">
                  🔒 Kredi/Banka Kartı
                  {!ONLINE_PAYMENT_ENABLED && (
                    <span className="ml-2 text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full align-middle">
                      GEÇİCİ OLARAK KAPALI
                    </span>
                  )}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {ONLINE_PAYMENT_ENABLED
                    ? 'Güvenli ödeme sayfasında kartınızla ödeyin.'
                    : 'Online kart ödemesi kısa süre içinde tekrar açılacak.'}
                </span>
              </span>
            </label>
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
              <a href="/kvkk" target="_blank" className="text-orange-500 font-semibold hover:underline">KVKK Aydınlatma Metni</a>&apos;ni okudum ve kabul ediyorum.
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
              <a href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-orange-500 font-semibold hover:underline">Mesafeli Satış Sözleşmesi</a>&apos;ni okudum ve kabul ediyorum.
            </span>
          </label>
        </div>

        <button
          onClick={payment === 'kapida' ? kapidaSiparis : getToken}
          disabled={loading || !form.name || !form.email || !form.phone || !form.address || !form.kvkk || !form.mesafeli}
          className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-goldink font-extrabold py-4 rounded-2xl text-base transition-colors"
        >
          {loading
            ? 'Gönderiliyor...'
            : payment === 'kapida'
              ? '✅ Siparişi Onayla'
              : '🔒 Ödemeye Geç'}
        </button>
        {payment === 'kapida' && (
          <p className="text-[11px] text-gray-500 text-center mt-2 leading-relaxed">
            Siparişi onayladığınızda ödeme alınmaz. Ödemeyi teslimat sırasında yaparsınız.
          </p>
        )}
      </div>
    </div>
  )
}
