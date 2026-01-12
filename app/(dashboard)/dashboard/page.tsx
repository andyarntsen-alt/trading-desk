import { Suspense } from 'react'
import { DashboardStats } from '@/components/dashboard/stats'
import { RecentTrades } from '@/components/dashboard/recent-trades'
import { AccountsOverview } from '@/components/dashboard/accounts-overview'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Your trading overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Trades</h2>
          <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
            <RecentTrades />
          </Suspense>
        </div>

        {/* Accounts Overview */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Accounts</h2>
          <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
            <AccountsOverview />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6 animate-pulse">
          <div className="h-4 bg-[#1f1f1f] rounded w-20 mb-2"></div>
          <div className="h-8 bg-[#1f1f1f] rounded w-24"></div>
        </div>
      ))}
    </div>
  )
}
