import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/accounts - Get all accounts for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching accounts:', error)
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
    }

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error in GET /api/accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/accounts - Create a new account
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: body.name,
        category: body.category || 'default',
        starting_balance: body.starting_balance || 0,
        current_balance: body.starting_balance || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating account:', error)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
