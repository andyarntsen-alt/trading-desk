import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/trades/[id] - Get a specific trade
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: trade, error } = await supabase
      .from('trades')
      .select('*, accounts(name)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    return NextResponse.json(trade)
  } catch (error) {
    console.error('Error in GET /api/trades/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/trades/[id] - Update a trade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const { data: trade, error } = await supabase
      .from('trades')
      .update({
        account_id: body.account_id,
        symbol: body.symbol,
        direction: body.direction,
        entry_price: body.entry_price,
        exit_price: body.exit_price,
        quantity: body.quantity,
        pnl: body.pnl,
        fees: body.fees,
        notes: body.notes,
        tags: body.tags,
        screenshot_url: body.screenshot_url,
        trade_date: body.trade_date,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating trade:', error)
      return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 })
    }

    return NextResponse.json(trade)
  } catch (error) {
    console.error('Error in PUT /api/trades/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/trades/[id] - Delete a trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting trade:', error)
      return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/trades/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
