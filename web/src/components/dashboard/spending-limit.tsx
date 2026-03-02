import { useQuery } from '@apollo/client/react'
import { BUDGET_PROGRESS_QUERY } from '@/graphql/budgets'
import type { BudgetProgressEntry } from '@/types/budget'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'

export function SpendingLimit() {
  const { currentHouseholdId, currentHousehold } = useHousehold()

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const { data, loading } = useQuery<{ budgetProgress: BudgetProgressEntry[] }>(
    BUDGET_PROGRESS_QUERY,
    {
      variables: { householdID: currentHouseholdId, month },
      skip: !currentHouseholdId,
    }
  )

  const currency = currentHousehold?.baseCurrency ?? 'KES'
  const entries = data?.budgetProgress ?? []

  const totalBudgeted = entries.reduce((sum, e) => sum + e.amountCents, 0)
  const totalSpent = entries.reduce((sum, e) => sum + e.spentCents, 0)
  const percentage = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0
  const isOverBudget = totalSpent > totalBudgeted

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 animate-pulse">
        <div className="h-4 w-40 rounded bg-muted mb-4" />
        <div className="h-3 w-full rounded-full bg-muted" />
      </div>
    )
  }

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Monthly Spending Limit</h3>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverBudget
              ? 'bg-rose-500'
              : percentage > 75
                ? 'bg-amber-400'
                : 'bg-emerald-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatCents(totalSpent, currency)}
          </span>{' '}
          spent
        </span>
        <span className="text-muted-foreground">
          {formatCents(totalBudgeted, currency)} budgeted
        </span>
      </div>

      {isOverBudget && (
        <p className="mt-2 text-xs text-rose-400">
          Over budget by {formatCents(totalSpent - totalBudgeted, currency)}
        </p>
      )}
    </div>
  )
}

