'use client'

import { useEffect, useRef } from 'react'

export default function SignOutPage() {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    // Auto-submit the form on mount
    formRef.current?.submit()
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <form ref={formRef} action="/auth/signout" method="POST">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Logger ut...</p>
        </div>
      </form>
    </div>
  )
}
