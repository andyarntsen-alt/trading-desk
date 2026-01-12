'use client'

import { useState } from 'react'
import { TradeForm } from '@/components/dashboard/trade-form'
import { TradeTable } from '@/components/dashboard/trade-table'
import { useTrades } from '@/hooks/use-trades'
import { useAccounts } from '@/hooks/use-accounts'

export default function TradesPage() {
  const [showForm, setShowForm] = useState(false)
  const { trades, isLoading, mutate } = useTrades()
  const { accounts } = useAccounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade Journal</h1>
          <p className="text-slate-400 mt-1">Track and analyze your trades</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Trade'}
        </button>
      </div>

      {/* Trade Form */}
      {showForm && (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">New Trade</h2>
          <TradeForm
            accounts={accounts || []}
            onSuccess={() => {
              setShowForm(false)
              mutate()
            }}
          />
        </div>
      )}

      {/* Trades Table */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading trades...</div>
        ) : (
          <TradeTable trades={trades || []} onDelete={mutate} />
        )}
      </div>
    </div>
  )
}
