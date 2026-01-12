'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignOutPage() {
  const [status, setStatus] = useState('Logger ut...')

  useEffect(() => {
    const doSignOut = async () => {
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
        setStatus('Ferdig!')
      } catch (e) {
        console.error('Logout error:', e)
        setStatus('Feil, omdirigerer...')
      }
      
      // Always redirect after 1 second
      setTimeout(() => {
        window.location.replace('/')
      }, 1000)
    }
    doSignOut()
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">{status}</p>
      </div>
    </div>
  )
}
