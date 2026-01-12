import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const origin = new URL(request.url).origin

  // Get all cookies and find Supabase ones
  const allCookies = cookieStore.getAll()
  
  // Create redirect response
  const response = NextResponse.redirect(`${origin}/`)
  
  // Delete ALL cookies that might be Supabase-related
  for (const cookie of allCookies) {
    // Clear any cookie that starts with 'sb-' (Supabase auth cookies)
    if (cookie.name.startsWith('sb-')) {
      // Delete with various path options to ensure it's cleared
      response.cookies.delete(cookie.name)
      response.cookies.set(cookie.name, '', { 
        expires: new Date(0), 
        path: '/',
        maxAge: 0,
      })
    }
  }
  
  // Also explicitly try common Supabase cookie names
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1]
  if (projectRef) {
    const authCookieName = `sb-${projectRef}-auth-token`
    response.cookies.delete(authCookieName)
    response.cookies.set(authCookieName, '', { 
      expires: new Date(0), 
      path: '/',
      maxAge: 0,
    })
    
    // Also the chunked versions
    for (let i = 0; i < 10; i++) {
      response.cookies.delete(`${authCookieName}.${i}`)
      response.cookies.set(`${authCookieName}.${i}`, '', { 
        expires: new Date(0), 
        path: '/',
        maxAge: 0,
      })
    }
  }

  return response
}

export async function POST(request: Request) {
  return GET(request)
}
