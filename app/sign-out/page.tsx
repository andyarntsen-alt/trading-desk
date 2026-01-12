'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function SignOutPage() {
  useEffect(() => {
    // Create Supabase client directly
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    
    // Sign out and redirect
    supabase.auth.signOut().finally(() => {
      window.location.href = '/'
    })
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">Logger ut...</p>
    </div>
  )
}
