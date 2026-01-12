'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignOutPage() {
  const [status, setStatus] = useState('Logger ut...')

  useEffect(() => {
    const signOut = async () => {
      try {
        // 1. Sign out on server (clears httpOnly cookies)
        await fetch('/api/auth/signout', { method: 'POST' })
        
        // 2. Sign out on client
        const supabase = createClient()
        await supabase.auth.signOut({ scope: 'local' })
        
        setStatus('Utlogget! Omdirigerer...')
        
      } catch (e) {
        console.error('Sign out error:', e)
        setStatus('Omdirigerer...')
      }
      
      // Wait a moment then hard redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = '/'
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
