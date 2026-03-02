import { formatCents } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { RecurringBill } from '@/types/budget'

interface BillCardProps {
  bill: RecurringBill
  currency: string
}

function StatusBadge({ status }: { status: RecurringBill['status'] }) {
  if (status === 'paid') {
    return (
      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
        Paid
      </Badge>
    )
  }
  if (status === 'overdue') {
    return <Badge variant="destructive" className="text-xs">Overdue</Badge>
  }
  return (
    <Badge variant="outline" className="text-amber-600 border-amber-600 text-xs">
      Pending
    </Badge>
  )
}

function FrequencyBadge({ frequency }: { frequency: RecurringBill['frequency'] }) {
  const label =
    frequency === 'monthly' ? 'Monthly' : frequency === 'weekly' ? 'Weekly' : 'Annual'
  return (
    <Badge variant="secondary" className="text-xs capitalize">
      {label}
    </Badge>
  )
}

export function BillCard({ bill, currency }: BillCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-base leading-tight">{bill.name}</span>
          <StatusBadge status={bill.status} />
        </div>

        <div className="text-lg font-bold">{formatCents(bill.amountCents, currency)}</div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Due on day {bill.dueDay}</span>
          <FrequencyBadge frequency={bill.frequency} />
        </div>

        {bill.category && (
          <div className="text-xs text-muted-foreground">{bill.category.name}</div>
        )}
      </CardContent>
    </Card>
  )
}
