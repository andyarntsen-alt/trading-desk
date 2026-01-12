'use client'

import { useState } from 'react'
import { useMigration } from '@/hooks/use-migration'

type Step = 'scan' | 'review' | 'migrate' | 'complete'

export function MigrationTool() {
  const [step, setStep] = useState<Step>('scan')
  const [clearAfterMigration, setClearAfterMigration] = useState(false)
  
  const {
    status,
    error,
    results,
    scannedData,
    scanLocalStorage,
    getSummary,
    migrate,
    clearLocalStorage,
    reset,
  } = useMigration()

  const summary = getSummary()

  const handleScan = () => {
    scanLocalStorage()
    setStep('review')
  }

  const handleMigrate = async () => {
    setStep('migrate')
    const migrationResults = await migrate()
    
    if (migrationResults) {
      if (clearAfterMigration) {
        clearLocalStorage()
      }
      setStep('complete')
    } else {
      setStep('review')
    }
  }

  const handleReset = () => {
    reset()
    setStep('scan')
  }

  const hasData = summary && (
    summary.accountsCount > 0 ||
    summary.tradesCount > 0 ||
    summary.hasSettings ||
    summary.playbookCount > 0 ||
    summary.symbolsCount > 0 ||
    summary.archivesCount > 0
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <StepIndicator 
            number={1} 
            label="Scan" 
            active={step === 'scan'} 
            completed={step !== 'scan'} 
          />
          <div className="w-12 h-0.5 bg-zinc-700" />
          <StepIndicator 
            number={2} 
            label="Review" 
            active={step === 'review'} 
            completed={step === 'migrate' || step === 'complete'} 
          />
          <div className="w-12 h-0.5 bg-zinc-700" />
          <StepIndicator 
            number={3} 
            label="Migrate" 
            active={step === 'migrate'} 
            completed={step === 'complete'} 
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        {/* Step 1: Scan */}
        {step === 'scan' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Scan for Existing Data</h2>
            <p className="text-zinc-400 mb-6">
              We&apos;ll scan your browser&apos;s localStorage for any existing trading data 
              from the previous version of the app.
            </p>
            <button
              onClick={handleScan}
              disabled={status === 'scanning'}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium rounded-lg transition-colors"
            >
              {status === 'scanning' ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 'review' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Review Data Found</h2>
            
            {!hasData ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-zinc-400 mb-4">
                  No existing data found in localStorage.
                </p>
                <button
                  onClick={handleReset}
                  className="text-emerald-500 hover:text-emerald-400 font-medium"
                >
                  Scan Again
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <DataCard 
                    label="Accounts" 
                    count={summary?.accountsCount || 0} 
                    icon="💰"
                  />
                  <DataCard 
                    label="Trades" 
                    count={summary?.tradesCount || 0} 
                    icon="📊"
                  />
                  <DataCard 
                    label="Playbook Setups" 
                    count={summary?.playbookCount || 0} 
                    icon="📖"
                  />
                  <DataCard 
                    label="Symbols" 
                    count={summary?.symbolsCount || 0} 
                    icon="📈"
                  />
                  <DataCard 
                    label="Daily Archives" 
                    count={summary?.archivesCount || 0} 
                    icon="📅"
                  />
                  <DataCard 
                    label="Settings" 
                    count={summary?.hasSettings ? 1 : 0} 
                    icon="⚙️"
                  />
                </div>

                <div className="flex items-center mb-6 p-3 bg-zinc-800/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="clearData"
                    checked={clearAfterMigration}
                    onChange={(e) => setClearAfterMigration(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                  />
                  <label htmlFor="clearData" className="ml-3 text-sm text-zinc-300">
                    Clear localStorage after successful migration
                  </label>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-zinc-400 hover:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMigrate}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Start Migration
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Migrating */}
        {step === 'migrate' && status === 'migrating' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-700" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Migrating Your Data</h2>
            <p className="text-zinc-400">
              Please wait while we transfer your data to the cloud...
            </p>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && results && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Migration Complete!</h2>
            <p className="text-zinc-400 mb-6">
              Your data has been successfully migrated to the cloud.
            </p>

            <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Migration Summary</h3>
              <ul className="space-y-2 text-sm">
                <ResultItem label="Accounts" count={results.accounts} />
                <ResultItem label="Trades" count={results.trades} />
                <ResultItem label="Playbook Setups" count={results.playbook} />
                <ResultItem label="Symbols" count={results.symbols} />
                <ResultItem label="Daily Archives" count={results.dailyArchives} />
                <ResultItem label="Settings" count={results.settings ? 1 : 0} />
              </ul>
            </div>

            {clearAfterMigration && (
              <p className="text-sm text-zinc-500 mb-4">
                ✓ Local storage has been cleared
              </p>
            )}

            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StepIndicator({ 
  number, 
  label, 
  active, 
  completed 
}: { 
  number: number
  label: string
  active: boolean
  completed: boolean 
}) {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${
          completed 
            ? 'bg-emerald-600 text-white' 
            : active 
              ? 'bg-emerald-600 text-white' 
              : 'bg-zinc-800 text-zinc-500'
        }`}
      >
        {completed ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          number
        )}
      </div>
      <span className={`mt-2 text-xs font-medium ${active ? 'text-white' : 'text-zinc-500'}`}>
        {label}
      </span>
    </div>
  )
}

function DataCard({ label, count, icon }: { label: string; count: number; icon: string }) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold text-white">{count}</span>
      </div>
      <p className="text-sm text-zinc-400 mt-1">{label}</p>
    </div>
  )
}

function ResultItem({ label, count }: { label: string; count: number }) {
  return (
    <li className="flex items-center justify-between text-zinc-400">
      <span>{label}</span>
      <span className={count > 0 ? 'text-emerald-500' : 'text-zinc-600'}>
        {count} migrated
      </span>
    </li>
  )
}
