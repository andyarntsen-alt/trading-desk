'use client'

import { useState, useCallback } from 'react'
import { mutationFetcher } from './fetcher'

export type LocalStorageData = {
  accounts?: Array<{
    name: string
    category?: string
    balance?: number
    startingBalance?: number
  }>
  trades?: Array<{
    symbol: string
    direction?: string
    entryPrice?: number
    exitPrice?: number
    quantity?: number
    pnl?: number
    fees?: number
    notes?: string
    tags?: string[]
    date?: string
    tradeDate?: string
  }>
  settings?: {
    theme?: { accent: string; mode: string }
    goals?: unknown
    dailyLossLimit?: unknown
    tiltSettings?: unknown
    widgetSettings?: unknown
    prepConfig?: unknown
    checklistConfig?: unknown
  }
  playbook?: Array<{
    name: string
    description?: string
    rules?: string[]
    screenshot?: string
  }>
  symbols?: Array<string | { symbol: string; notes?: string }>
  dailyArchives?: Array<{
    date: string
    dailyPrep?: unknown
    checklist?: unknown
    review?: unknown
    screenshots?: unknown
  }>
  traderName?: string
}

export type MigrationResults = {
  accounts: number
  trades: number
  settings: boolean
  playbook: number
  symbols: number
  dailyArchives: number
}

export type MigrationStatus = 'idle' | 'scanning' | 'migrating' | 'success' | 'error'

// Common localStorage keys used by the trading desk app
const KNOWN_KEYS = {
  accounts: ['accounts', 'tradingAccounts', 'trading_accounts'],
  trades: ['trades', 'journal', 'tradeJournal', 'trade_journal'],
  settings: ['settings', 'userSettings', 'user_settings', 'config'],
  playbook: ['playbook', 'setups', 'playbookSetups', 'playbook_setups'],
  symbols: ['symbols', 'watchlist', 'watch_list'],
  dailyArchives: ['dailyArchives', 'daily_archives', 'archives'],
  traderName: ['traderName', 'trader_name', 'userName', 'user_name'],
}

export function useMigration() {
  const [status, setStatus] = useState<MigrationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<MigrationResults | null>(null)
  const [scannedData, setScannedData] = useState<LocalStorageData | null>(null)

  // Scan localStorage for existing data
  const scanLocalStorage = useCallback((): LocalStorageData => {
    setStatus('scanning')
    setError(null)
    
    const data: LocalStorageData = {}

    // Helper to get data from localStorage with multiple possible keys
    const getData = <T,>(keys: string[]): T | undefined => {
      for (const key of keys) {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            return JSON.parse(item) as T
          }
        } catch {
          // Continue to next key
        }
      }
      return undefined
    }

    // Scan for each data type
    data.accounts = getData(KNOWN_KEYS.accounts)
    data.trades = getData(KNOWN_KEYS.trades)
    data.settings = getData(KNOWN_KEYS.settings)
    data.playbook = getData(KNOWN_KEYS.playbook)
    data.symbols = getData(KNOWN_KEYS.symbols)
    data.dailyArchives = getData(KNOWN_KEYS.dailyArchives)
    data.traderName = getData(KNOWN_KEYS.traderName)

    setScannedData(data)
    setStatus('idle')
    
    return data
  }, [])

  // Get summary of scanned data
  const getSummary = useCallback(() => {
    if (!scannedData) return null
    
    return {
      accountsCount: scannedData.accounts?.length || 0,
      tradesCount: scannedData.trades?.length || 0,
      hasSettings: !!scannedData.settings,
      playbookCount: scannedData.playbook?.length || 0,
      symbolsCount: scannedData.symbols?.length || 0,
      archivesCount: scannedData.dailyArchives?.length || 0,
      hasTraderName: !!scannedData.traderName,
    }
  }, [scannedData])

  // Perform migration
  const migrate = useCallback(async (data?: LocalStorageData) => {
    const dataToMigrate = data || scannedData
    
    if (!dataToMigrate) {
      setError('No data to migrate. Please scan localStorage first.')
      return null
    }

    setStatus('migrating')
    setError(null)

    try {
      const response = await mutationFetcher<{
        success: boolean
        message: string
        results: MigrationResults
      }>('/api/migrate', {
        method: 'POST',
        body: dataToMigrate,
      })

      setResults(response.results)
      setStatus('success')
      
      return response.results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Migration failed'
      setError(errorMessage)
      setStatus('error')
      return null
    }
  }, [scannedData])

  // Clear localStorage after successful migration
  const clearLocalStorage = useCallback(() => {
    const allKeys = [
      ...KNOWN_KEYS.accounts,
      ...KNOWN_KEYS.trades,
      ...KNOWN_KEYS.settings,
      ...KNOWN_KEYS.playbook,
      ...KNOWN_KEYS.symbols,
      ...KNOWN_KEYS.dailyArchives,
      ...KNOWN_KEYS.traderName,
    ]

    for (const key of allKeys) {
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore errors
      }
    }
  }, [])

  // Reset state
  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setResults(null)
    setScannedData(null)
  }, [])

  return {
    status,
    error,
    results,
    scannedData,
    scanLocalStorage,
    getSummary,
    migrate,
    clearLocalStorage,
    reset,
  }
}
