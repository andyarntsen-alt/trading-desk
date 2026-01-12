import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function getRecentTrades() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: trades } = await supabase
    .from('trades')
    .select('id, symbol, direction, pnl, trade_date')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: false })
    .limit(5)

  return trades || []
}

export async function RecentTrades() {
  const trades = await getRecentTrades()

  if (trades.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 mb-4">No trades yet</p>
        <Link
          href="/trades"
          className="text-emerald-400 hover:text-emerald-300 text-sm"
        >
          Add your first trade →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {trades.map((trade) => (
        <div
          key={trade.id}
          className="flex items-center justify-between py-2 border-b border-[#1f1f1f] last:border-0"
        >
          <div>
            <div className="font-medium text-white">{trade.symbol}</div>
            <div className="text-xs text-slate-500">
              {trade.direction?.toUpperCase()} • {trade.trade_date}
            </div>
          </div>
          <div
            className={`font-semibold ${
              (trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
          </div>
        </div>
      ))}
      <Link
        href="/trades"
        className="block text-center text-emerald-400 hover:text-emerald-300 text-sm pt-2"
      >
        View all trades →
      </Link>
    </div>
  )
}
