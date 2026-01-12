'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function SignOutPage() {
  const [status, setStatus] = useState('Logger ut...')

  useEffect(() => {
    const signOut = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.error('Sign out error:', error)
          setStatus('Feil ved utlogging...')
        } else {
          setStatus('Utlogget! Omdirigerer...')
        }
        
        // Wait a moment to ensure cookies are cleared
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (e) {
        console.error('Sign out error:', e)
        setStatus('Feil ved utlogging...')
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
