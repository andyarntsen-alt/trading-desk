'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignOutPage() {
  const [status, setStatus] = useState('Logger ut...')

  useEffect(() => {
    const signOut = async () => {
      try {
        // Sign out on client first
        const supabase = createClient()
        await supabase.auth.signOut({ scope: 'local' })
        setStatus('Omdirigerer...')
      } catch (e) {
        console.error('Sign out error:', e)
      }
      
      // Redirect to server-side signout which clears cookies and redirects home
      window.location.href = '/api/auth/signout'
    }
    signOut()
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
