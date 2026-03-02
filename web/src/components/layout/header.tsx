import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/providers/auth-provider'
import { Wallet, LogOut } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="md:hidden flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10">
          <Wallet className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Expenser</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        {user && (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/10 text-xs font-semibold text-emerald-400 uppercase">
              {user.name?.charAt(0) ?? '?'}
            </div>
            <button
              onClick={logout}
              className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
