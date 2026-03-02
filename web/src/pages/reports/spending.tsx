import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { SPENDING_BY_CATEGORY_QUERY } from '@/graphql/reports'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'
import type { CategorySpend } from '@/types/reports'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ArrowLeft, PieChart, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

function getMonthStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function getToday(): Date {
  return new Date()
}

export function SpendingReportPage() {
  const { currentHouseholdId, currentHousehold } = useHousehold()
  const currency = currentHousehold?.baseCurrency ?? 'KES'

  const [startDate, setStartDate] = useState<Date>(getMonthStart)
  const [endDate, setEndDate] = useState<Date>(getToday)
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)

  const { data, loading, error } = useQuery<{ spendingByCategory: CategorySpend[] }>(
    SPENDING_BY_CATEGORY_QUERY,
    {
      variables: {
        householdID: currentHouseholdId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      skip: !currentHouseholdId,
    }
  )

  const categories = data?.spendingByCategory ?? []
  const chartData = categories.map((cat) => ({
    name: cat.name,
    amount: cat.totalCents / 100,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link to="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/10">
          <PieChart className="h-5 w-5 text-rose-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Spending by Category</h1>
          <p className="text-xs text-muted-foreground">Breakdown of expenses by category</p>
        </div>
      </div>

      {/* Date range filter */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-sm font-semibold mb-3">Date Range</h3>
        <div className="flex gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Start Date</Label>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {format(startDate, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => {
                    if (d) { setStartDate(d); setStartOpen(false) }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">End Date</Label>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {format(endDate, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => {
                    if (d) { setEndDate(d); setEndOpen(false) }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border bg-card p-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${80 - i * 15}%` }} />
          ))}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{error.message}</div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">No expenses found in this date range.</p>
        </div>
      )}

      {categories.length > 0 && (
        <>
          {/* Chart */}
          <div className="rounded-xl border bg-card p-6">
            <ResponsiveContainer width="100%" height={Math.max(200, categories.length * 40)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" width={80} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  formatter={(value: number | undefined) => value != null ? formatCents(value * 100, currency) : ''}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown table */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-sm font-semibold mb-4">Category Breakdown</h3>
            <div className="divide-y divide-border">
              {categories.map((cat) => (
                <div key={cat.categoryID} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                    <span className="text-sm font-semibold text-rose-400 min-w-[90px] text-right">
                      {formatCents(cat.totalCents, currency)}
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
