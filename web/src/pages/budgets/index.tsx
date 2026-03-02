import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { BUDGETS_QUERY, BUDGET_PROGRESS_QUERY } from '@/graphql/budgets'
import { useHousehold } from '@/providers/household-provider'
import type { Budget, BudgetProgressEntry } from '@/types/budget'
import { BudgetCard } from '@/components/budgets/budget-card'
import { Button } from '@/components/ui/button'
import { Target, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

function formatMonth(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

function displayMonth(ym: string): string {
  const [year, month] = ym.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function addMonths(ym: string, delta: number): string {
  const [year, month] = ym.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return formatMonth(date)
}

export function BudgetsPage() {
  const { currentHouseholdId, currentHousehold } = useHousehold()
  const currency = currentHousehold?.baseCurrency ?? 'KES'
  const [selectedMonth, setSelectedMonth] = useState<string>(() => formatMonth(new Date()))

  const { data, loading, error } = useQuery<{ budgets: Budget[] }>(
    BUDGETS_QUERY,
    { skip: !currentHouseholdId }
  )

  const { data: progressData } = useQuery<{ budgetProgress: BudgetProgressEntry[] }>(
    BUDGET_PROGRESS_QUERY,
    {
      variables: { householdID: currentHouseholdId, month: selectedMonth },
      skip: !currentHouseholdId,
    }
  )

  const allBudgets = data?.budgets ?? []
  const budgets = allBudgets.filter((b) => b.month === selectedMonth)

  const spentMap = new Map<string, number>()
  for (const entry of progressData?.budgetProgress ?? []) {
    spentMap.set(String(entry.budgetID), entry.spentCents)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
            <Target className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
            <p className="text-xs text-muted-foreground">Track spending against your limits</p>
          </div>
        </div>
        <Button asChild className="gap-1.5">
          <Link to="/budgets/create"><Plus className="h-4 w-4" /> Add Budget</Link>
        </Button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
        <button
          onClick={() => setSelectedMonth((m) => addMonths(m, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-3 text-sm font-medium min-w-[140px] text-center">
          {displayMonth(selectedMonth)}
        </span>
        <button
          onClick={() => setSelectedMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {!currentHouseholdId && (
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Select a household to view budgets.</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-2 rounded-full bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{error.message}</div>
      )}

      {currentHouseholdId && !loading && !error && (
        budgets.length === 0 ? (
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">No budgets set for this month.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                currency={currency}
                spentCents={spentMap.get(budget.id)}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}
