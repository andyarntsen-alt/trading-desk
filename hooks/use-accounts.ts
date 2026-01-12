'use client'

import useSWR from 'swr'
import { fetcher, mutationFetcher } from './fetcher'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'

export type Account = Tables<'accounts'>
export type CreateAccountInput = Omit<InsertTables<'accounts'>, 'user_id'>
export type UpdateAccountInput = UpdateTables<'accounts'>

export function useAccounts() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Account[]>(
    '/api/accounts',
    fetcher
  )

  const createAccount = async (account: CreateAccountInput) => {
    const newAccount = await mutationFetcher<Account>('/api/accounts', {
      method: 'POST',
      body: account,
    })
    
    // Optimistically update the cache
    mutate((current) => (current ? [...current, newAccount] : [newAccount]), false)
    
    return newAccount
  }

  const updateAccount = async (id: string, updates: UpdateAccountInput) => {
    const updatedAccount = await mutationFetcher<Account>(`/api/accounts/${id}`, {
      method: 'PUT',
      body: updates,
    })
    
    // Update cache
    mutate(
      (current) =>
        current?.map((a) => (a.id === id ? updatedAccount : a)),
      false
    )
    
    return updatedAccount
  }

  const deleteAccount = async (id: string) => {
    await mutationFetcher<{ success: boolean }>(`/api/accounts/${id}`, {
      method: 'DELETE',
    })
    
    // Remove from cache
    mutate((current) => current?.filter((a) => a.id !== id), false)
  }

  // Calculate totals
  const totals = data
    ? {
        totalBalance: data.reduce((sum, a) => sum + a.current_balance, 0),
        totalStartingBalance: data.reduce((sum, a) => sum + a.starting_balance, 0),
        totalPnl: data.reduce(
          (sum, a) => sum + (a.current_balance - a.starting_balance),
          0
        ),
        accountCount: data.length,
      }
    : null

  return {
    accounts: data,
    totals,
    isLoading,
    isValidating,
    error,
    mutate,
    createAccount,
    updateAccount,
    deleteAccount,
  }
}

// Hook for a single account
export function useAccount(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Account>(
    id ? `/api/accounts/${id}` : null,
    fetcher
  )

  return {
    account: data,
    isLoading,
    error,
    mutate,
  }
}
