'use client'

import { useState } from 'react'
import type { Tables } from '@/types/database'

interface TradeTableProps {
  trades: (Tables<'trades'> & { accounts?: { name: string } | null })[]
  onDelete: () => void
}

export function TradeTable({ trades, onDelete }: TradeTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trade?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete trade')
      }

      onDelete()
    } catch (error) {
      console.error('Error deleting trade:', error)
      alert('Failed to delete trade')
    } finally {
      setDeletingId(null)
    }
  }

  if (trades.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No trades yet. Add your first trade to get started.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#0f0f0f] border-b border-[#1f1f1f]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Direction
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Entry
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Exit
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              P&L
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Account
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1f1f1f]">
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-[#0f0f0f] transition-colors">
              <td className="px-4 py-3 text-sm text-slate-300">
                {trade.trade_date}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-white">
                {trade.symbol}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    trade.direction === 'long'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {trade.direction?.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {trade.entry_price?.toLocaleString() || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {trade.exit_price?.toLocaleString() || '-'}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`font-medium ${
                    (trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">
                {trade.accounts?.name || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <button
                  onClick={() => handleDelete(trade.id)}
                  disabled={deletingId === trade.id}
                  className="text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  {deletingId === trade.id ? '...' : '🗑️'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
