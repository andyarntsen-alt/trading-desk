import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  // Get trades for this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: trades } = await supabase
    .from('trades')
    .select('pnl, direction')
    .eq('user_id', authUser.id)
    .gte('trade_date', startOfMonth.toISOString().split('T')[0])

  const totalTrades = trades?.length || 0
  const totalPnl = trades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0
  const winners = trades?.filter(t => (t.pnl || 0) > 0).length || 0
  const winRate = totalTrades > 0 ? (winners / totalTrades) * 100 : 0

  // Get accounts total
  const { data: accounts } = await supabase
    .from('accounts')
    .select('current_balance')
    .eq('user_id', authUser.id)

  const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.current_balance || 0), 0) || 0

  return {
    totalTrades,
    totalPnl,
    winRate,
    totalBalance,
  }
}

export async function DashboardStats() {
  const stats = await getStats()

  if (!stats) {
    return (
      <div className="text-slate-500">Unable to load stats</div>
    )
  }

  const statCards = [
    {
      label: 'Total Trades',
      value: stats.totalTrades.toString(),
      subtitle: 'This month',
    },
    {
      label: 'P&L',
      value: `$${stats.totalPnl.toLocaleString()}`,
      subtitle: 'This month',
      color: stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      subtitle: 'This month',
    },
    {
      label: 'Account Balance',
      value: `$${stats.totalBalance.toLocaleString()}`,
      subtitle: 'Total',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, i) => (
        <div
          key={i}
          className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6"
        >
          <div className="text-sm text-slate-500 mb-1">{stat.label}</div>
          <div className={`text-2xl font-bold ${stat.color || 'text-white'}`}>
            {stat.value}
          </div>
          <div className="text-xs text-slate-600 mt-1">{stat.subtitle}</div>
        </div>
      ))}
    </div>
  )
}
