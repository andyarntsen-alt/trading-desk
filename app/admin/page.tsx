import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createAdminClient, createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const FALLBACK_ADMIN_EMAILS = ['s.arntsen@yahoo.com']

const getAdminEmails = () => {
  const envValue = process.env.ADMIN_EMAILS
  const emails = (envValue || FALLBACK_ADMIN_EMAILS.join(','))
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return emails.length > 0 ? emails : FALLBACK_ADMIN_EMAILS
}

const requireAdmin = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const email = user.email?.toLowerCase() || ''
  if (!getAdminEmails().includes(email)) {
    redirect('/desk')
  }

  return user
}

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const isUserBanned = (value?: string | null) => {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return date.getTime() > Date.now()
}

const loadUsers = async () => {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 200 })
  if (error) {
    throw new Error('Failed to load users')
  }
  return data.users
}

async function banUser(formData: FormData) {
  'use server'
  const adminUser = await requireAdmin()
  const userId = String(formData.get('userId') || '')
  if (!userId || userId === adminUser.id) return

  const adminClient = createAdminClient()
  await adminClient.auth.admin.updateUserById(userId, { ban_duration: '8760h' })
  revalidatePath('/admin')
}

async function unbanUser(formData: FormData) {
  'use server'
  await requireAdmin()
  const userId = String(formData.get('userId') || '')
  if (!userId) return

  const adminClient = createAdminClient()
  await adminClient.auth.admin.updateUserById(userId, { ban_duration: 'none' })
  revalidatePath('/admin')
}

async function deleteUser(formData: FormData) {
  'use server'
  const adminUser = await requireAdmin()
  const userId = String(formData.get('userId') || '')
  if (!userId || userId === adminUser.id) return

  const adminClient = createAdminClient()
  await adminClient.auth.admin.deleteUser(userId, true)
  revalidatePath('/admin')
}

export default async function AdminPage() {
  const adminUser = await requireAdmin()

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] p-8 text-center">
          <h1 className="text-2xl font-semibold mb-3">Admin access unavailable</h1>
          <p className="text-sm text-slate-400">
            Missing `SUPABASE_SERVICE_ROLE_KEY`. Add it to the server environment
            to load users.
          </p>
        </div>
      </div>
    )
  }

  const users = await loadUsers()

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin</h1>
            <p className="text-sm text-slate-400">Signed in as {adminUser.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/desk"
              className="px-4 py-2 rounded-lg border border-[#2a2a2a] text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              Open Desk
            </a>
            <a
              href="/sign-out"
              className="px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-sm text-rose-200 hover:bg-rose-500/20 transition-colors"
            >
              Sign out
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">User Accounts</h2>
            <p className="text-sm text-slate-400">
              {users.length} total users
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Admin access is restricted by `ADMIN_EMAILS`.
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0d0d0d] text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Last sign in</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isBanned = isUserBanned(user.banned_until)
                return (
                  <tr
                    key={user.id}
                    className="border-t border-[#161616] text-slate-200"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium">{user.email || 'No email'}</div>
                      <div className="text-xs text-slate-500">{user.id}</div>
                    </td>
                    <td className="px-5 py-4">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-4">{formatDate(user.last_sign_in_at)}</td>
                    <td className="px-5 py-4">
                      {isBanned ? (
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-rose-500/15 text-rose-200">
                          Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-300">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isBanned ? (
                          <form action={unbanUser}>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-xs text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                            >
                              Enable
                            </button>
                          </form>
                        ) : (
                          <form action={banUser}>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-xs text-rose-200 hover:bg-rose-500/10 transition-colors"
                            >
                              Disable
                            </button>
                          </form>
                        )}
                        <form action={deleteUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-xs text-rose-300 hover:bg-rose-500/20 transition-colors"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
