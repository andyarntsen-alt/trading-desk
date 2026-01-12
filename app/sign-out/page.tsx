'use client'

import { useEffect, useTransition } from 'react'
import { signOut } from './actions'

export default function SignOutPage() {
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      await signOut()
    })
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">
          {isPending ? 'Logger ut...' : 'Omdirigerer...'}
        </p>
      </div>
    </div>
  )
}
