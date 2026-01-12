'use client'

import useSWR from 'swr'
import { fetcher, mutationFetcher } from './fetcher'
import type { Tables, InsertTables, Json } from '@/types/database'

export type DailyArchive = Tables<'daily_archives'>
export type CreateArchiveInput = Omit<InsertTables<'daily_archives'>, 'user_id'>

export type ArchiveFilters = {
  date?: string
  startDate?: string
  endDate?: string
}

function buildArchivesUrl(filters?: ArchiveFilters): string {
  const params = new URLSearchParams()
  
  if (filters?.date) params.set('date', filters.date)
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)
  
  const queryString = params.toString()
  return `/api/daily-archives${queryString ? `?${queryString}` : ''}`
}

export function useDailyArchives(filters?: ArchiveFilters) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<DailyArchive[]>(
    buildArchivesUrl(filters),
    fetcher
  )

  const saveArchive = async (archive: CreateArchiveInput) => {
    const savedArchive = await mutationFetcher<DailyArchive>('/api/daily-archives', {
      method: 'POST',
      body: archive,
    })
    
    // Update cache - replace if same date exists, add if new
    mutate((current) => {
      if (!current) return [savedArchive]
      
      const existingIndex = current.findIndex(
        (a) => a.archive_date === savedArchive.archive_date
      )
      
      if (existingIndex >= 0) {
        const updated = [...current]
        updated[existingIndex] = savedArchive
        return updated
      }
      
      return [savedArchive, ...current]
    }, false)
    
    return savedArchive
  }

  return {
    archives: data,
    isLoading,
    isValidating,
    error,
    mutate,
    saveArchive,
  }
}

// Hook for today's archive
export function useTodayArchive() {
  const today = new Date().toISOString().split('T')[0]
  const { archives, isLoading, error, saveArchive, mutate } = useDailyArchives({
    date: today,
  })

  const archive = archives?.[0] || null

  const savePrepData = async (prepData: Json) => {
    return saveArchive({
      archive_date: today,
      prep_data: prepData,
      checklist_data: archive?.checklist_data,
      review_data: archive?.review_data,
      screenshots: archive?.screenshots,
    })
  }

  const saveChecklistData = async (checklistData: Json) => {
    return saveArchive({
      archive_date: today,
      prep_data: archive?.prep_data,
      checklist_data: checklistData,
      review_data: archive?.review_data,
      screenshots: archive?.screenshots,
    })
  }

  const saveReviewData = async (reviewData: Json) => {
    return saveArchive({
      archive_date: today,
      prep_data: archive?.prep_data,
      checklist_data: archive?.checklist_data,
      review_data: reviewData,
      screenshots: archive?.screenshots,
    })
  }

  return {
    archive,
    isLoading,
    error,
    mutate,
    saveArchive,
    savePrepData,
    saveChecklistData,
    saveReviewData,
  }
}
