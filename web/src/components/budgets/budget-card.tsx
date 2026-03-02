import { formatCents } from '@/lib/format'
import type { Budget } from '@/types/budget'

interface BudgetCardProps {
  budget: Budget
  currency: string
  spentCents?: number
}

export function BudgetCard({ budget, currency, spentCents = 0 }: BudgetCardProps) {
  const pct = budget.amountCents > 0 && spentCents > 0
    ? Math.round((spentCents / budget.amountCents) * 100)
    : 0
  const remainingCents = budget.amountCents - spentCents

  const barColor =
    pct > 90 ? 'bg-rose-400' : pct > 75 ? 'bg-amber-400' : 'bg-emerald-400'
  const remainColor = remainingCents < 0 ? 'text-rose-400' : 'text-emerald-400'

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold">{budget.category.name}</h3>
        {budget.rollover && (
          <span className="rounded-full bg-sky-400/10 px-2.5 py-0.5 text-xs font-medium text-sky-400">
            Rollover
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-medium">{formatCents(budget.amountCents, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Spent</span>
          <span className="font-medium">
            {spentCents > 0 ? formatCents(spentCents, currency) : 'No data'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Remaining</span>
          <span className={`font-medium ${remainColor}`}>
            {formatCents(remainingCents, currency)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground text-right">{pct}% used</p>
      </div>
    </div>
  )
}
