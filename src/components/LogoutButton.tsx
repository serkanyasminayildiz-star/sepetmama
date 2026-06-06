'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => { setLoading(true); signOut({ callbackUrl: '/' }) }}
      className="w-full bg-white border border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
    </button>
  )
}
