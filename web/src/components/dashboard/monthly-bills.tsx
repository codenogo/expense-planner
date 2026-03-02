import { useQuery } from '@apollo/client/react'
import { RECURRING_BILLS_QUERY } from '@/graphql/budgets'
import type { RecurringBill } from '@/types/budget'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'
import { Receipt } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-emerald-400/10 text-emerald-400',
    overdue: 'bg-rose-400/10 text-rose-400',
    pending: 'bg-amber-400/10 text-amber-400',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        styles[status] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {status}
    </span>
  )
}

function getDueDate(dueDay: number): string {
  const now = new Date()
  const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay)
  return dueDate.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function MonthlyBills() {
  const { currentHousehold } = useHousehold()

  const { data, loading } = useQuery<{ recurringBills: RecurringBill[] }>(
    RECURRING_BILLS_QUERY
  )

  const currency = currentHousehold?.baseCurrency ?? 'KES'
  const bills = data?.recurringBills ?? []

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 animate-pulse">
        <div className="h-4 w-32 rounded bg-muted mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (bills.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Monthly Bills</h3>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
        <span>Name</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Due Date</span>
        <span className="text-right">Status</span>
      </div>

      {/* Bill rows */}
      <div className="divide-y divide-border">
        {bills.slice(0, 6).map((bill) => (
          <div
            key={bill.id}
            className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium truncate">{bill.name}</span>
            </div>
            <span className="text-sm font-medium text-right whitespace-nowrap">
              {formatCents(bill.amountCents, currency)}
            </span>
            <span className="text-xs text-muted-foreground text-right whitespace-nowrap">
              {getDueDate(bill.dueDay)}
            </span>
            <div className="text-right">
              <StatusBadge status={bill.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

