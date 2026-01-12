import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    
    // Get origin from request
    const origin = new URL(request.url).origin

    // Try to sign out from Supabase
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            },
          },
        }
      )
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Supabase signout error:', e)
    }

    // Redirect to home page
    const response = NextResponse.redirect(`${origin}/`)
    
    // Clear all potential auth cookies
    const cookieNames = [
      'sb-access-token',
      'sb-refresh-token', 
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
    ]
    
    for (const name of cookieNames) {
      response.cookies.set(name, '', { expires: new Date(0), path: '/' })
    }
    
    // Also try to clear any sb- cookies
    const allCookies = cookieStore.getAll()
    for (const cookie of allCookies) {
      if (cookie.name.startsWith('sb-')) {
        response.cookies.set(cookie.name, '', { expires: new Date(0), path: '/' })
      }
    }

    return response
  } catch (e) {
    console.error('Signout route error:', e)
    // Even on error, redirect home
    const origin = new URL(request.url).origin
    return NextResponse.redirect(`${origin}/`)
  }
}

export async function POST(request: Request) {
  return GET(request)
}
