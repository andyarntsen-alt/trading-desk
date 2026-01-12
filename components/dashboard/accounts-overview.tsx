import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function getAccounts() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, name, category, current_balance, starting_balance')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return accounts || []
}

export async function AccountsOverview() {
  const accounts = await getAccounts()

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 mb-4">No accounts yet</p>
        <Link
          href="/settings"
          className="text-emerald-400 hover:text-emerald-300 text-sm"
        >
          Add an account →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => {
        const pnl = Number(account.current_balance) - Number(account.starting_balance)
        const pnlPercent = account.starting_balance 
          ? (pnl / Number(account.starting_balance)) * 100 
          : 0

        return (
          <div
            key={account.id}
            className="p-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-white">{account.name}</div>
              <span className="text-xs px-2 py-0.5 bg-[#1f1f1f] text-slate-400 rounded">
                {account.category}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-semibold text-white">
                ${Number(account.current_balance).toLocaleString()}
              </div>
              <div
                className={`text-sm ${
                  pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
