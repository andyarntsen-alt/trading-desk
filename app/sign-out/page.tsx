'use client'

import { useEffect, useState } from 'react'

export default function SignOutPage() {
  const [status, setStatus] = useState('Logger ut...')

  useEffect(() => {
    // Just redirect to server-side signout
    // The server will clear cookies and redirect to home
    window.location.href = '/api/auth/signout'
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">{status}</p>
      </div>
    </div>
  )
}
