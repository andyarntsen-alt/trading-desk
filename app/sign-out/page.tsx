'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignOutPage() {
  useEffect(() => {
    const doSignOut = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    }
    doSignOut()
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Logger ut...</p>
      </div>
    </div>
  )
}
