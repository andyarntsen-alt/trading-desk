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

  return NextResponse.json({
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    supabaseUrlPrefix: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : null,
    supabaseKeyPrefix: supabaseKey ? supabaseKey.substring(0, 10) + '...' : null,
    nodeEnv: process.env.NODE_ENV,
    connectionTest,
  })
}
