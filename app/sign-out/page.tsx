'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignOutPage() {
  const [status, setStatus] = useState('Logger ut...')

  useEffect(() => {
    const signOut = async () => {
      try {
        const supabase = createClient()
        
        // Sign out - this clears the session
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.error('Sign out error:', error)
        }
        
        setStatus('Utlogget!')
        
        // Clear any localStorage items
        localStorage.removeItem('supabase.auth.token')
        
        // Small delay then redirect
        await new Promise(r => setTimeout(r, 500))
        
      } catch (e) {
        console.error('Sign out error:', e)
      }
      
      // Hard redirect with cache bypass
      window.location.replace('/')
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
