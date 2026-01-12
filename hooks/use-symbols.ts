'use client'

import useSWR from 'swr'
import { fetcher, mutationFetcher } from './fetcher'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'

export type Symbol = Tables<'symbols'>
export type CreateSymbolInput = Omit<InsertTables<'symbols'>, 'user_id'>
export type UpdateSymbolInput = UpdateTables<'symbols'>

export function useSymbols() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Symbol[]>(
    '/api/symbols',
    fetcher
  )

  const addSymbol = async (symbol: CreateSymbolInput) => {
    const newSymbol = await mutationFetcher<Symbol>('/api/symbols', {
      method: 'POST',
      body: symbol,
    })
    
    // Optimistically update the cache
    mutate((current) => (current ? [...current, newSymbol] : [newSymbol]), false)
    
    return newSymbol
  }

  const removeSymbol = async (id: string) => {
    await mutationFetcher<{ success: boolean }>(`/api/symbols?id=${id}`, {
      method: 'DELETE',
    })
    
    // Remove from cache
    mutate((current) => current?.filter((s) => s.id !== id), false)
  }

  // Get unique symbols as a simple list
  const symbolList = data?.map((s) => s.symbol) || []

  return {
    symbols: data,
    symbolList,
    isLoading,
    isValidating,
    error,
    mutate,
    addSymbol,
    removeSymbol,
  }
}
