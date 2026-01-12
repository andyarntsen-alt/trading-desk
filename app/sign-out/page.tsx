'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function SignOutPage() {
  useEffect(() => {
    const signOut = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        await supabase.auth.signOut()
      } catch (e) {
        console.error('Sign out error:', e)
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
        <p className="text-slate-400 text-sm">Logger ut...</p>
      </div>
    </div>
  )
}
