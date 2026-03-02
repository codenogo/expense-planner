import type { TransactionSummary } from '@/types/reports'
import { formatCents } from '@/lib/format'
import { getCategoryIcon } from '@/lib/category-icons'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: TransactionSummary[]
  currency?: string
}

export function RecentTransactions({ transactions, currency = 'KES' }: RecentTransactionsProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Recent Transactions</h3>
        <span className="text-xs text-muted-foreground">This month</span>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions yet</p>
      ) : (
        <div className="divide-y divide-border">
          {transactions.map((tx) => {
            const totalCents = tx.entries.reduce((sum, e) => sum + e.amountCents, 0)
            const isIncome = totalCents > 0
            const Icon = getCategoryIcon(tx.category?.name)

            return (
              <div key={tx.id} className="flex items-center gap-3 py-3">
                {/* Icon */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isIncome ? 'bg-emerald-400/10' : 'bg-rose-400/10'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  />
                </div>

                {/* Description & category */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category?.name ?? 'Uncategorized'}
                  </p>
                </div>

                {/* Date */}
                <span className="hidden text-xs text-muted-foreground sm:block whitespace-nowrap">
                  {new Date(tx.date).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>

                {/* Amount */}
                <div className="flex items-center gap-1 text-right">
                  {isIncome ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatCents(Math.abs(totalCents), currency)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
