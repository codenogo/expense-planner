import { formatCents } from '@/lib/format'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const colorClass =
    pct > 90
      ? '[&>div]:bg-red-500'
      : pct > 75
      ? '[&>div]:bg-yellow-500'
      : '[&>div]:bg-green-500'

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-base font-semibold">{budget.category.name}</CardTitle>
        {budget.rollover && (
          <Badge variant="secondary" className="text-xs">Rollover</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
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
          <span className={`font-medium ${remainingCents < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCents(remainingCents, currency)}
          </span>
        </div>
        <div className={colorClass}>
          <Progress value={Math.min(pct, 100)} className="h-2" />
        </div>
        <p className="text-xs text-muted-foreground text-right">{pct}% used</p>
      </CardContent>
    </Card>
  )
}
