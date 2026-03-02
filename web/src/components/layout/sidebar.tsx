import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Upload,
  BarChart3,
  Wallet,
  Users,
  PieChart,
  TrendingUp,
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

export function Sidebar() {
  const location = useLocation()
  const isReportsSection = location.pathname.startsWith('/reports')

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-semibold">Expense Planner</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <div key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/' || item.to === '/reports'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive || (item.to === '/reports' && isReportsSection)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
            {item.to === '/reports' && isReportsSection && (
              <div className="ml-4 mt-1 space-y-1">
                {reportSubItems.map((sub) => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
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
        ))}
      </nav>
    </aside>
  )
}
