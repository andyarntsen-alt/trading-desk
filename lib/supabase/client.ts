import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Supabase config mangler: URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`
    )
  }

  // Check if key looks valid (JWT format)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    throw new Error(
      `Ugyldig Supabase nøkkel format. Starter med: ${supabaseAnonKey.substring(0, 10)}...`
    )
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )
}
