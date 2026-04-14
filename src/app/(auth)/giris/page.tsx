'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const inputStyle = {
  width: '100%',
  border: '1.5px solid #d1d5db',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#000000',
  fontWeight: '500',
  outline: 'none',
  background: '#ffffff',
}

export default function GirisPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) { setError('E-posta veya şifre hatalı.') }
    else { router.push('/') }
  }

  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-8 shadow-sm">
      <h1 className="text-xl font-extrabold text-gray-800 mb-6 text-center">Giriş Yap</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px' }}>E-posta</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px' }}>Şifre</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl transition-colors">
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-500">
        Hesabın yok mu?{' '}
        <Link href="/kayit" className="text-orange-500 font-extrabold hover:underline">Kayıt Ol</Link>
      </div>
    </div>
  )
}
