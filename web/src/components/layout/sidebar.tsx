import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/providers/auth-provider'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Upload,
  BarChart3,
  Wallet,
  Users,
  PieChart,
  TrendingUp,
  CalendarDays,
  Receipt,
  LogOut,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/import', label: 'Import', icon: Upload },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/household', label: 'Household', icon: Users },
]

const reportSubItems = [
  { to: '/reports/spending', label: 'Spending', icon: PieChart },
  { to: '/reports/trend', label: 'Trend', icon: TrendingUp },
]

const budgetSubItems = [
  { to: '/budgets', label: 'Monthly', icon: CalendarDays },
  { to: '/budgets/bills', label: 'Bills', icon: Receipt },
]

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const isReportsSection = location.pathname.startsWith('/reports')
  const isBudgetsSection = location.pathname.startsWith('/budgets')

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4 gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10">
          <Wallet className="h-4 w-4 text-emerald-400" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Expenser</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isSection =
            (item.to === '/reports' && isReportsSection) ||
            (item.to === '/budgets' && isBudgetsSection)
          return (
            <div key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/' || item.to === '/reports' || item.to === '/budgets'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive || isSection
                      ? 'bg-emerald-400/10 text-emerald-400'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
              {item.to === '/reports' && isReportsSection && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {reportSubItems.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'text-emerald-400'
                            : 'text-muted-foreground hover:text-foreground'
                        }`
                      }
                    >
                      <sub.icon className="h-3.5 w-3.5" />
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
              {item.to === '/budgets' && isBudgetsSection && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {budgetSubItems.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      end={sub.to === '/budgets'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'text-emerald-400'
                            : 'text-muted-foreground hover:text-foreground'
                        }`
                      }
                    >
                      <sub.icon className="h-3.5 w-3.5" />
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-medium text-emerald-400">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
