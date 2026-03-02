import { Link } from 'react-router-dom'
import { PieChart, TrendingUp, ChevronRight } from 'lucide-react'

const reports = [
  {
    to: '/reports/spending',
    title: 'Spending by Category',
    description: 'See how your spending breaks down by category over a date range.',
    icon: PieChart,
    color: 'rose',
  },
  {
    to: '/reports/trend',
    title: 'Monthly Trend',
    description: 'Track income, expenses, and net savings over time.',
    icon: TrendingUp,
    color: 'emerald',
  },
] as const

const colorMap = {
  rose: { bg: 'bg-rose-400/10', text: 'text-rose-400' },
  emerald: { bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
} as const

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze your household finances
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon
          const colors = colorMap[report.color]
          return (
            <Link key={report.to} to={report.to}>
              <div className="group rounded-xl border bg-card p-6 transition-colors hover:border-emerald-400/40 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.bg}`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">{report.title}</h3>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{report.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
