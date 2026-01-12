import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/symbols - Get all symbols/watchlist
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: symbols, error } = await supabase
      .from('symbols')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching symbols:', error)
      return NextResponse.json({ error: 'Failed to fetch symbols' }, { status: 500 })
    }

    return NextResponse.json(symbols)
  } catch (error) {
    console.error('Error in GET /api/symbols:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/symbols - Add a symbol
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: symbol, error } = await supabase
      .from('symbols')
      .insert({
        user_id: user.id,
        symbol: body.symbol,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding symbol:', error)
      return NextResponse.json({ error: 'Failed to add symbol' }, { status: 500 })
    }

    return NextResponse.json(symbol, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/symbols:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/symbols - Remove a symbol (using query param)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const symbolId = searchParams.get('id')

    if (!symbolId) {
      return NextResponse.json({ error: 'Symbol ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('symbols')
      .delete()
      .eq('id', symbolId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting symbol:', error)
      return NextResponse.json({ error: 'Failed to delete symbol' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/symbols:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
