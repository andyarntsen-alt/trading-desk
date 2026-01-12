'use client'

import useSWR from 'swr'
import { fetcher, mutationFetcher } from './fetcher'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'

export type Trade = Tables<'trades'> & {
  accounts?: { name: string } | null
}

export type TradeFilters = {
  startDate?: string
  endDate?: string
  symbol?: string
  accountId?: string
}

export type CreateTradeInput = Omit<InsertTables<'trades'>, 'user_id'>
export type UpdateTradeInput = UpdateTables<'trades'>

function buildTradesUrl(filters?: TradeFilters): string {
  const params = new URLSearchParams()
  
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)
  if (filters?.symbol) params.set('symbol', filters.symbol)
  if (filters?.accountId) params.set('accountId', filters.accountId)
  
  const queryString = params.toString()
  return `/api/trades${queryString ? `?${queryString}` : ''}`
}

export function useTrades(filters?: TradeFilters) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Trade[]>(
    buildTradesUrl(filters),
    fetcher
  )

  const createTrade = async (trade: CreateTradeInput) => {
    const newTrade = await mutationFetcher<Trade>('/api/trades', {
      method: 'POST',
      body: trade,
    })
    
    // Optimistically update the cache
    mutate((current) => current ? [newTrade, ...current] : [newTrade], false)
    
    return newTrade
  }

  const updateTrade = async (id: string, updates: UpdateTradeInput) => {
    const updatedTrade = await mutationFetcher<Trade>(`/api/trades/${id}`, {
      method: 'PUT',
      body: updates,
    })
    
    // Update cache
    mutate(
      (current) =>
        current?.map((t) => (t.id === id ? updatedTrade : t)),
      false
    )
    
    return updatedTrade
  }

  const deleteTrade = async (id: string) => {
    await mutationFetcher<{ success: boolean }>(`/api/trades/${id}`, {
      method: 'DELETE',
    })
    
    // Remove from cache
    mutate((current) => current?.filter((t) => t.id !== id), false)
  }

  // Calculate stats from trades
  const stats = data
    ? {
        totalTrades: data.length,
        totalPnl: data.reduce((sum, t) => sum + (t.pnl || 0), 0),
        winningTrades: data.filter((t) => (t.pnl || 0) > 0).length,
        losingTrades: data.filter((t) => (t.pnl || 0) < 0).length,
        winRate:
          data.length > 0
            ? (data.filter((t) => (t.pnl || 0) > 0).length / data.length) * 100
            : 0,
        averagePnl:
          data.length > 0
            ? data.reduce((sum, t) => sum + (t.pnl || 0), 0) / data.length
            : 0,
      }
    : null

  return {
    trades: data,
    stats,
    isLoading,
    isValidating,
    error,
    mutate,
    createTrade,
    updateTrade,
    deleteTrade,
  }
}

// Hook for a single trade
export function useTrade(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Trade>(
    id ? `/api/trades/${id}` : null,
    fetcher
  )

  return {
    trade: data,
    isLoading,
    error,
    mutate,
  }
}
