import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/trades - Get all trades for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const symbol = searchParams.get('symbol')
    const accountId = searchParams.get('accountId')

    let query = supabase
      .from('trades')
      .select('*, accounts(name)')
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false })

    if (startDate) {
      query = query.gte('trade_date', startDate)
    }
    if (endDate) {
      query = query.lte('trade_date', endDate)
    }
    if (symbol) {
      query = query.eq('symbol', symbol)
    }
    if (accountId) {
      query = query.eq('account_id', accountId)
    }

    const { data: trades, error } = await query

    if (error) {
      console.error('Error fetching trades:', error)
      return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
    }

    return NextResponse.json(trades)
  } catch (error) {
    console.error('Error in GET /api/trades:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/trades - Create a new trade
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const accountId = body.account_id || null
    let accountBalance = null

    if (accountId) {
      const { data: account } = await supabase
        .from('accounts')
        .select('id, current_balance')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single()

      if (!account) {
        return NextResponse.json({ error: 'Invalid account' }, { status: 400 })
      }

      accountBalance = account.current_balance
    }

    const { data: trade, error } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        account_id: accountId,
        symbol: body.symbol,
        direction: body.direction,
        entry_price: body.entry_price,
        exit_price: body.exit_price,
        quantity: body.quantity,
        pnl: body.pnl,
        fees: body.fees || 0,
        notes: body.notes,
        tags: body.tags || [],
        screenshot_url: body.screenshot_url,
        trade_date: body.trade_date,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating trade:', error.message, error.details, error.hint)
      return NextResponse.json({ 
        error: 'Failed to create trade', 
        details: error.message,
        hint: error.hint 
      }, { status: 500 })
    }

    // Update account balance if account is specified
    if (accountId && body.pnl && accountBalance !== null) {
      await supabase
        .from('accounts')
        .update({
          current_balance: accountBalance + body.pnl,
        })
        .eq('id', accountId)
        .eq('user_id', user.id)
    }

    return NextResponse.json(trade, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/trades:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
