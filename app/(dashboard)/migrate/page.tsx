import { MigrationTool } from '@/components/migration/migration-tool'

export default function MigratePage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Data Migration</h1>
          <p className="text-zinc-400">
            Transfer your existing trading data from localStorage to the cloud
          </p>
        </div>
        
        <MigrationTool />

        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">What gets migrated?</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong className="text-zinc-300">Trading Accounts</strong> — Your account balances and categories</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong className="text-zinc-300">Trade Journal</strong> — All your logged trades with P&L, notes, and tags</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong className="text-zinc-300">Playbook Setups</strong> — Your trading setups and rules</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong className="text-zinc-300">Watchlist</strong> — Your saved symbols and notes</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong className="text-zinc-300">Daily Archives</strong> — Prep notes, checklists, and reviews</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong className="text-zinc-300">Settings</strong> — Theme, goals, and widget preferences</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
