import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

// POST /api/migrate - Migrate localStorage data to Supabase
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      accounts, 
      trades, 
      settings, 
      playbook, 
      symbols, 
      dailyArchives,
      traderName 
    } = body

    const results = {
      accounts: 0,
      trades: 0,
      settings: false,
      playbook: 0,
      symbols: 0,
      dailyArchives: 0,
    }

    // Migrate trader name
    if (traderName) {
      await supabase
        .from('users')
        .update({ trader_name: traderName })
        .eq('id', user.id)
    }

    // Migrate accounts
    if (accounts && Array.isArray(accounts) && accounts.length > 0) {
      const accountsToInsert = accounts.map((acc: { name: string; category?: string; balance?: number; startingBalance?: number }) => ({
        user_id: user.id,
        name: acc.name,
        category: acc.category || 'default',
        starting_balance: acc.startingBalance || acc.balance || 0,
        current_balance: acc.balance || 0,
      }))

      const { data: insertedAccounts, error } = await supabase
        .from('accounts')
        .insert(accountsToInsert)
        .select()

      if (!error && insertedAccounts) {
        results.accounts = insertedAccounts.length
      }
    }

    // Migrate trades/journal
    if (trades && Array.isArray(trades) && trades.length > 0) {
      const tradesToInsert = trades.map((trade: {
        symbol: string
        direction?: string
        entryPrice?: number
        exitPrice?: number
        quantity?: number
        pnl?: number
        fees?: number
        notes?: string
        tags?: string[]
        date?: string
        tradeDate?: string
      }) => {
        const dir = trade.direction?.toLowerCase()
        const validDirection: 'long' | 'short' | null = 
          dir === 'long' ? 'long' : dir === 'short' ? 'short' : null
        
        return {
          user_id: user.id,
          symbol: trade.symbol,
          direction: validDirection,
          entry_price: trade.entryPrice,
          exit_price: trade.exitPrice,
          quantity: trade.quantity,
          pnl: trade.pnl,
          fees: trade.fees || 0,
          notes: trade.notes,
          tags: trade.tags || [],
          trade_date: trade.date || trade.tradeDate || new Date().toISOString().split('T')[0],
        }
      })

      const { data: insertedTrades, error } = await supabase
        .from('trades')
        .insert(tradesToInsert)
        .select()

      if (!error && insertedTrades) {
        results.trades = insertedTrades.length
      }
    }

    // Migrate settings
    if (settings) {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme: settings.theme || { accent: 'emerald', mode: 'dark' },
          goals: settings.goals,
          daily_loss_limit: settings.dailyLossLimit,
          tilt_settings: settings.tiltSettings,
          widget_settings: settings.widgetSettings,
          prep_config: settings.prepConfig,
          checklist_config: settings.checklistConfig,
        })

      if (!error) {
        results.settings = true
      }
    }

    // Migrate playbook
    if (playbook && Array.isArray(playbook) && playbook.length > 0) {
      const setupsToInsert = playbook.map((setup: {
        name: string
        description?: string
        rules?: string[]
        screenshot?: string
      }) => ({
        user_id: user.id,
        name: setup.name,
        description: setup.description,
        rules: setup.rules || [],
        screenshot_url: setup.screenshot,
      }))

      const { data: insertedSetups, error } = await supabase
        .from('playbook_setups')
        .insert(setupsToInsert)
        .select()

      if (!error && insertedSetups) {
        results.playbook = insertedSetups.length
      }
    }

    // Migrate symbols
    if (symbols && Array.isArray(symbols) && symbols.length > 0) {
      const symbolsToInsert = symbols.map((sym: string | { symbol: string; notes?: string }) => ({
        user_id: user.id,
        symbol: typeof sym === 'string' ? sym : sym.symbol,
        notes: typeof sym === 'string' ? null : sym.notes,
      }))

      const { data: insertedSymbols, error } = await supabase
        .from('symbols')
        .insert(symbolsToInsert)
        .select()

      if (!error && insertedSymbols) {
        results.symbols = insertedSymbols.length
      }
    }

    // Migrate daily archives
    if (dailyArchives && Array.isArray(dailyArchives) && dailyArchives.length > 0) {
      // Use upsert to handle duplicates
      for (const archive of dailyArchives) {
        const archiveData = archive as {
          date: string
          dailyPrep?: Json
          checklist?: Json
          review?: Json
          screenshots?: Json
        }
        
        const { error } = await supabase
          .from('daily_archives')
          .upsert({
            user_id: user.id,
            archive_date: archiveData.date,
            prep_data: archiveData.dailyPrep ?? null,
            checklist_data: archiveData.checklist ?? null,
            review_data: archiveData.review ?? null,
            screenshots: archiveData.screenshots ?? null,
          }, { onConflict: 'user_id,archive_date' })

        if (!error) {
          results.dailyArchives++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results,
    })
  } catch (error) {
    console.error('Error in POST /api/migrate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
