import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/debug - Check environment variables and test connection
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let connectionTest = 'not tested'
  
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.getSession()
    connectionTest = error ? `error: ${error.message}` : 'success'
  } catch (err) {
    connectionTest = `exception: ${err instanceof Error ? err.message : 'unknown'}`
  }

  // More detailed debug info
  const keyStartsWithEyJ = supabaseKey?.startsWith('eyJ') || false
  const keyLength = supabaseKey?.length || 0

  return NextResponse.json({
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    supabaseUrlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : null,
    supabaseKeyPrefix: supabaseKey ? supabaseKey.substring(0, 15) + '...' : null,
    keyStartsWithEyJ,
    keyLength,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'not set',
    connectionTest,
  })
}
