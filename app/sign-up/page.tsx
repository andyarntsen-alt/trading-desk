'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        
        if (data.session) {
          window.location.href = '/desk'
        } else {
          setReady(true)
        }
      } catch {
        setReady(true)
      }
    }
    
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setSuccess(true)
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm text-center bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-4">Check your email</h1>
          <p className="text-slate-400 mb-6">
            We sent a confirmation link to<br />
            <span className="text-white font-medium">{email}</span>
          </p>
          <Link
            href="/sign-in"
            className="inline-block px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/brand/tradingdesk-icon-64.png" alt="Trading Desk" className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-semibold">Trading Desk</span>
          <span className="px-1.5 py-0.5 text-[9px] font-medium bg-emerald-500/20 text-emerald-400 rounded">BETA</span>
        </div>
        
        <h1 className="text-2xl font-semibold text-center mb-2">Create account</h1>
        <p className="text-center text-sm text-slate-400 mb-8">
          Start your trading journal
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-[#0d0d0d] border border-[#2a2a2a] text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
          />
          
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg bg-[#0d0d0d] border border-[#2a2a2a] text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-white font-medium hover:text-emerald-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
