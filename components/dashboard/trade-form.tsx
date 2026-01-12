'use client'

import { useState } from 'react'
import type { Tables } from '@/types/database'

interface TradeFormProps {
  accounts: Tables<'accounts'>[]
  onSuccess: () => void
}

export function TradeForm({ accounts, onSuccess }: TradeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    symbol: '',
    direction: 'long' as 'long' | 'short',
    entry_price: '',
    exit_price: '',
    quantity: '',
    fees: '',
    notes: '',
    trade_date: new Date().toISOString().split('T')[0],
    account_id: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Calculate PnL
      const entry = parseFloat(formData.entry_price) || 0
      const exit = parseFloat(formData.exit_price) || 0
      const qty = parseFloat(formData.quantity) || 0
      const fees = parseFloat(formData.fees) || 0
      
      let pnl = 0
      if (entry && exit && qty) {
        pnl = formData.direction === 'long'
          ? (exit - entry) * qty - fees
          : (entry - exit) * qty - fees
      }

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          entry_price: entry || null,
          exit_price: exit || null,
          quantity: qty || null,
          fees: fees,
          pnl: pnl,
          account_id: formData.account_id || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create trade')
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating trade:', error)
      alert('Failed to create trade')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Symbol */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Symbol *</label>
          <input
            type="text"
            required
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            placeholder="BTCUSD"
          />
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Direction</label>
          <select
            value={formData.direction}
            onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'long' | 'short' })}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Date *</label>
          <input
            type="date"
            required
            value={formData.trade_date}
            onChange={(e) => setFormData({ ...formData, trade_date: e.target.value })}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Entry Price */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Entry Price</label>
          <input
            type="number"
            step="any"
            value={formData.entry_price}
            onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>

        {/* Exit Price */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Exit Price</label>
          <input
            type="number"
            step="any"
            value={formData.exit_price}
            onChange={(e) => setFormData({ ...formData, exit_price: e.target.value })}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Quantity</label>
          <input
            type="number"
            step="any"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            placeholder="0"
          />
        </div>

        {/* Fees */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Fees</label>
          <input
            type="number"
            step="any"
            value={formData.fees}
            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>

        {/* Account */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Account</label>
          <select
            value={formData.account_id}
            onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">No account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg text-white focus:border-emerald-500 focus:outline-none resize-none"
          rows={3}
          placeholder="Trade notes..."
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Trade'}
        </button>
      </div>
    </form>
  )
}
