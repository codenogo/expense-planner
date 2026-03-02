import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MONTHLY_TREND_QUERY } from '@/graphql/reports'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'
import type { MonthSummary } from '@/types/reports'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp } from 'lucide-react'

const monthOptions = [3, 6, 12]

export function TrendReportPage() {
  const { currentHouseholdId, currentHousehold } = useHousehold()
  const currency = currentHousehold?.baseCurrency ?? 'KES'
  const [months, setMonths] = useState(6)

  const { data, loading, error } = useQuery<{ monthlyTrend: MonthSummary[] }>(
    MONTHLY_TREND_QUERY,
    {
      variables: { householdID: currentHouseholdId, months },
      skip: !currentHouseholdId,
    }
  )

  const trends = data?.monthlyTrend ?? []
  const chartData = trends.map((m) => ({
    month: m.month,
    income: m.incomeCents / 100,
    expenses: m.expenseCents / 100,
    net: m.netCents / 100,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link to="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Monthly Trend</h1>
          <p className="text-xs text-muted-foreground">Income, expenses & net over time</p>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1 w-fit">
        {monthOptions.map((n) => (
          <button
            key={n}
            onClick={() => setMonths(n)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              months === n
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {n} Months
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-xl border bg-card p-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${90 - i * 15}%` }} />
          ))}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{error.message}</div>
      )}

      {!loading && !error && trends.length === 0 && (
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">No data available for this period.</p>
        </div>
      )}

      {trends.length > 0 && (
        <>
          {/* Chart */}
          <div className="rounded-xl border bg-card p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  formatter={(value: number | undefined) => value != null ? formatCents(value * 100, currency) : ''}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#34d399" name="Income" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="#fb7185" name="Expenses" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="net" stroke="#38bdf8" name="Net" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Data table */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-sm font-semibold mb-4">Monthly Breakdown</h3>
            <div className="divide-y divide-border">
              {trends.map((m) => (
                <div key={m.month} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium">{m.month}</span>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-emerald-400 min-w-[90px] text-right">
                      {formatCents(m.incomeCents, currency)}
                    </span>
                    <span className="text-sm text-rose-400 min-w-[90px] text-right">
                      {formatCents(m.expenseCents, currency)}
                    </span>
                    <span className={`text-sm font-semibold min-w-[90px] text-right ${
                      m.netCents >= 0 ? 'text-sky-400' : 'text-rose-400'
                    }`}>
                      {formatCents(m.netCents, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
