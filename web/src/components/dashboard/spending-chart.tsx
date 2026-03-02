import { useQuery } from '@apollo/client/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { MONTHLY_TREND_QUERY } from '@/graphql/reports'
import type { MonthSummary } from '@/types/reports'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'

const MONTHS_TO_SHOW = 8

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleString('en-US', { month: 'short' })
}

export function SpendingChart() {
  const { currentHouseholdId, currentHousehold } = useHousehold()

  const { data, loading } = useQuery<{ monthlyTrend: MonthSummary[] }>(
    MONTHLY_TREND_QUERY,
    {
      variables: { householdID: currentHouseholdId, months: MONTHS_TO_SHOW },
      skip: !currentHouseholdId,
    }
  )

  const currency = currentHousehold?.baseCurrency ?? 'KES'
  const trend = data?.monthlyTrend ?? []

  const chartData = trend.map((m) => ({
    month: formatMonth(m.month),
    income: m.incomeCents / 100,
    expense: m.expenseCents / 100,
  }))

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Profit & Loss</h3>
          <p className="text-xs text-muted-foreground">
            Income vs expenses over the last {MONTHS_TO_SHOW} months
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-400" />
            <span className="text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-400" />
            <span className="text-muted-foreground">Expense</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      )}

      {!loading && chartData.length === 0 && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">No data yet</p>
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(v: number) => {
                  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
                  return String(v)
                }}
                width={45}
              />
              <Tooltip
                cursor={{ fill: 'color-mix(in oklch, var(--muted) 30%, transparent)' }}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => formatCents(value * 100, currency)}
              />
              <Bar
                dataKey="income"
                fill="#34d399"
                radius={[4, 4, 0, 0]}
                name="Income"
              />
              <Bar
                dataKey="expense"
                fill="#fb7185"
                radius={[4, 4, 0, 0]}
                name="Expense"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
