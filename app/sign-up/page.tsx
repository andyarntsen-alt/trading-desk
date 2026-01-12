'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

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
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sjekk e-posten din</h1>
          <p className="text-gray-600 mb-6">
            Vi har sendt en bekreftelseslenke til {email}
          </p>
          <Link href="/sign-in" className="text-black font-medium">
            Tilbake til innlogging
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">Opprett konto</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
              {error}
            </div>
          )}
          
          <input
            type="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-lg"
          />
          
          <input
            type="password"
            placeholder="Passord (minst 6 tegn)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border rounded-lg"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Oppretter...' : 'Opprett konto'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-gray-600">
          Har du konto? <Link href="/sign-in" className="text-black font-medium">Logg inn</Link>
        </p>
      </div>
    </div>
  )
}
