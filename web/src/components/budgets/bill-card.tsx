import { formatCents } from '@/lib/format'
import type { RecurringBill } from '@/types/budget'

interface BillCardProps {
  bill: RecurringBill
  currency: string
}

const statusStyles: Record<string, string> = {
  paid: 'bg-emerald-400/10 text-emerald-400',
  overdue: 'bg-rose-400/10 text-rose-400',
  pending: 'bg-amber-400/10 text-amber-400',
}

const statusLabel: Record<string, string> = {
  paid: 'Paid',
  overdue: 'Overdue',
  pending: 'Pending',
}

const frequencyLabel: Record<string, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  annual: 'Annual',
}

export function BillCard({ bill, currency }: BillCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-tight">{bill.name}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[bill.status] ?? statusStyles.pending}`}>
          {statusLabel[bill.status] ?? 'Pending'}
        </span>
      </div>

      <div className="text-lg font-bold">{formatCents(bill.amountCents, currency)}</div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Due on day {bill.dueDay}</span>
        <span className="rounded-full bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {frequencyLabel[bill.frequency] ?? bill.frequency}
        </span>
      </div>

      {bill.category && (
        <div className="text-xs text-muted-foreground">{bill.category.name}</div>
      )}
    </div>
  )
}
