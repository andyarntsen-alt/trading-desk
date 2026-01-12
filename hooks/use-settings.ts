'use client'

import useSWR from 'swr'
import { fetcher, mutationFetcher } from './fetcher'
import type { Json } from '@/types/database'

export type ThemeSettings = {
  accent: string
  mode: 'light' | 'dark'
}

export type UserSettings = {
  id?: string
  user_id?: string
  theme: ThemeSettings | Json
  goals: Json | null
  daily_loss_limit: Json | null
  tilt_settings: Json | null
  widget_settings: Json | null
  prep_config: Json | null
  checklist_config: Json | null
  trader_name?: string | null
}

export type UpdateSettingsInput = Partial<UserSettings>

export function useSettings() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<UserSettings>(
    '/api/settings',
    fetcher
  )

  const updateSettings = async (updates: UpdateSettingsInput) => {
    const updatedSettings = await mutationFetcher<UserSettings>('/api/settings', {
      method: 'PUT',
      body: updates,
    })
    
    // Update cache
    mutate(updatedSettings, false)
    
    return updatedSettings
  }

  // Helper to update specific settings
  const updateTheme = async (theme: ThemeSettings) => {
    return updateSettings({ ...data, theme })
  }

  const updateGoals = async (goals: Json) => {
    return updateSettings({ ...data, goals })
  }

  const updateDailyLossLimit = async (dailyLossLimit: Json) => {
    return updateSettings({ ...data, daily_loss_limit: dailyLossLimit })
  }

  const updateTraderName = async (traderName: string) => {
    return updateSettings({ trader_name: traderName })
  }

  return {
    settings: data,
    isLoading,
    isValidating,
    error,
    mutate,
    updateSettings,
    updateTheme,
    updateGoals,
    updateDailyLossLimit,
    updateTraderName,
  }
}
