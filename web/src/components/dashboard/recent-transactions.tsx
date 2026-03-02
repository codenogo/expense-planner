import type { TransactionSummary } from '@/types/reports'
import { formatCents } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RecentTransactionsProps {
  transactions: TransactionSummary[]
  currency?: string
}

export function RecentTransactions({ transactions, currency = 'KES' }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const totalCents = tx.entries.reduce((sum, e) => sum + e.amountCents, 0)
              const isIncome = totalCents > 0

              return (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{tx.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                      {tx.category && (
                        <span className="text-xs text-muted-foreground">
                          {tx.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : ''}{formatCents(totalCents, currency)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
