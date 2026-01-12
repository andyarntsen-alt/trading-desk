'use client'

import useSWR from 'swr'
import { fetcher, mutationFetcher } from './fetcher'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'

export type PlaybookSetup = Tables<'playbook_setups'>
export type CreateSetupInput = Omit<InsertTables<'playbook_setups'>, 'user_id'>
export type UpdateSetupInput = UpdateTables<'playbook_setups'>

export function usePlaybook() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<PlaybookSetup[]>(
    '/api/playbook',
    fetcher
  )

  const createSetup = async (setup: CreateSetupInput) => {
    const newSetup = await mutationFetcher<PlaybookSetup>('/api/playbook', {
      method: 'POST',
      body: setup,
    })
    
    // Optimistically update the cache
    mutate((current) => (current ? [newSetup, ...current] : [newSetup]), false)
    
    return newSetup
  }

  const updateSetup = async (id: string, updates: UpdateSetupInput) => {
    const updatedSetup = await mutationFetcher<PlaybookSetup>(`/api/playbook/${id}`, {
      method: 'PUT',
      body: updates,
    })
    
    // Update cache
    mutate(
      (current) =>
        current?.map((s) => (s.id === id ? updatedSetup : s)),
      false
    )
    
    return updatedSetup
  }

  const deleteSetup = async (id: string) => {
    await mutationFetcher<{ success: boolean }>(`/api/playbook/${id}`, {
      method: 'DELETE',
    })
    
    // Remove from cache
    mutate((current) => current?.filter((s) => s.id !== id), false)
  }

  return {
    setups: data,
    isLoading,
    isValidating,
    error,
    mutate,
    createSetup,
    updateSetup,
    deleteSetup,
  }
}

// Hook for a single setup
export function useSetup(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<PlaybookSetup>(
    id ? `/api/playbook/${id}` : null,
    fetcher
  )

  return {
    setup: data,
    isLoading,
    error,
    mutate,
  }
}
