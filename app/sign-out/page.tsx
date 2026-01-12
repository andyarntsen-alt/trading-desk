import { signOut } from './actions'

export default function SignOutPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <form action={signOut}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Logger ut...</p>
          <button type="submit" className="sr-only">Logg ut</button>
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `document.forms[0].submit()`
        }} />
      </form>
    </div>
  )
}
