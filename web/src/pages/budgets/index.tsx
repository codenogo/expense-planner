import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { BUDGETS_QUERY } from '@/graphql/budgets'
import { useHousehold } from '@/providers/household-provider'
import type { Budget } from '@/types/budget'
import { BudgetCard } from '@/components/budgets/budget-card'
import { Button } from '@/components/ui/button'

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

  const allBudgets = data?.budgets ?? []
  const budgets = allBudgets.filter((b) => b.month === selectedMonth)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <Button asChild>
          <Link to="/budgets/create">Add Budget</Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedMonth((m) => addMonths(m, -1))}
        >
          &larr; Prev
        </Button>
        <span className="font-medium min-w-[140px] text-center">{displayMonth(selectedMonth)}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedMonth((m) => addMonths(m, 1))}
        >
          Next &rarr;
        </Button>
      </div>

      {!currentHouseholdId && (
        <p className="text-muted-foreground">Select a household to view budgets.</p>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {currentHouseholdId && !loading && !error && (
        budgets.length === 0 ? (
          <p className="text-muted-foreground">No budgets set for this month.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                currency={currency}
                spentCents={budget.spentCents}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}
