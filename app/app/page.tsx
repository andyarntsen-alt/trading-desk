import Link from 'next/link'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Trading Desk</h1>
          </div>

          <Link
            href="/sign-out"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Logg ut
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Your trading overview and analytics</p>
          </div>

          {/* Placeholder Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Trades</div>
              <div className="text-2xl font-bold text-gray-900">0</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-gray-900">-</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">P&L</div>
              <div className="text-2xl font-bold text-gray-900">$0</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Active Goals</div>
              <div className="text-2xl font-bold text-gray-900">0</div>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trading Desk App</h3>
              <p className="text-gray-600 mb-4">
                The full trading application is being built. For now, you can access the legacy version.
              </p>
              <a
                href="/desk"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Open Legacy App →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
