'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function SignOutPage() {
  const [status, setStatus] = useState('Logger ut...')

  useEffect(() => {
    const signOut = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!url || !key) {
          console.error('Missing Supabase env vars')
          setStatus('Mangler konfigurasjon...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          window.location.href = '/'
          return
        }
        
        const supabase = createBrowserClient(url, key)
        
        // Sign out from Supabase (scope: 'local' to just clear this browser)
        await supabase.auth.signOut({ scope: 'local' })
        
        setStatus('Utlogget! Omdirigerer...')
        
        // Wait a moment to ensure cookies are cleared
        await new Promise(resolve => setTimeout(resolve, 300))
        
      } catch (e) {
        console.error('Sign out error:', e)
        // Even if there's an error, redirect anyway
        setStatus('Omdirigerer...')
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      // Hard redirect to clear all state
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
