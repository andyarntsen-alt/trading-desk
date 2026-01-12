'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Daily Prep', href: '/prep', icon: '☀️' },
  { name: 'Checklist', href: '/checklist', icon: '✅' },
  { name: 'Trade Journal', href: '/trades', icon: '📈' },
  { name: 'Review', href: '/review', icon: '📝' },
  { name: 'Playbook', href: '/playbook', icon: '📚' },
  { name: 'Analysis', href: '/analysis', icon: '🔍' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col">
      {/* Header */}
      <div className="px-4 py-5 border-b border-[#1f1f1f]">
        <Link href="/dashboard" className="block">
          <div className="text-xl font-bold uppercase tracking-tight text-white">
            TRADING DESK
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
            Pro Dashboard
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <Link
            href="/sign-out"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Logg ut
          </Link>
          <div className="text-xs text-slate-500">
            © 2026 Trading Desk
          </div>
        </div>
      </div>
    </aside>
  )
}
