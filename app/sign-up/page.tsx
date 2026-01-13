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

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          window.location.href = '/desk'
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke koble til Supabase')
    }
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrering feilet')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <div className="text-center bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h1 className="text-2xl font-semibold mb-4">Sjekk e-posten din</h1>
          <p className="text-slate-400 mb-6">
            Vi har sendt en bekreftelseslenke til {email}
          </p>
          <Link
            href="/sign-in"
            className="text-white font-medium hover:text-emerald-300 transition-colors"
          >
            Tilbake til innlogging
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 shadow-2xl shadow-black/40">
        <h1 className="text-2xl font-semibold text-center mb-2">Opprett konto</h1>
        <p className="text-center text-sm text-slate-400 mb-8">
          Get access to Trading Desk
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <input
            type="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-[#0d0d0d] border border-[#2a2a2a] text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
          />
          
          <input
            type="password"
            placeholder="Passord (minst 6 tegn)"
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
            {loading ? 'Oppretter...' : 'Opprett konto'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-400">
          Har du konto?{' '}
          <Link href="/sign-in" className="text-white font-medium hover:text-emerald-300 transition-colors">
            Logg inn
          </Link>
        </p>
      </div>
    </div>
  )
}
