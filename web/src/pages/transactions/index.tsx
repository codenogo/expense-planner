import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { TRANSACTIONS_QUERY } from '@/graphql/transactions'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { getCategoryIcon } from '@/lib/category-icons'
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface TransactionItem {
  id: string
  description: string
  date: string
  status: string
  entries: {
    id: string
    amountCents: number
    account: { id: string; name: string; type: string }
  }[]
  category: { id: string; name: string } | null
}

function getTransactionAmount(tx: TransactionItem): number {
  return tx.entries.reduce((sum, e) => sum + e.amountCents, 0)
}

function isIncome(tx: TransactionItem): boolean {
  return (
    tx.entries.some((e) => e.account.type === 'income') ||
    getTransactionAmount(tx) > 0
  )
}

function StatusPill({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    posted: 'bg-emerald-400/10 text-emerald-400',
    pending: 'bg-amber-400/10 text-amber-400',
    void: 'bg-rose-400/10 text-rose-400',
  }
  const cls = colorMap[status] ?? 'bg-muted text-muted-foreground'
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {status}
    </span>
  )
}

function TransactionList({
  transactions,
  currency,
}: {
  transactions: TransactionItem[]
  currency: string
}) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No transactions found
      </p>
    )
  }

  return (
    <div className="divide-y divide-border">
      {transactions.map((tx) => {
        const amount = getTransactionAmount(tx)
        const income = isIncome(tx)
        const Icon = getCategoryIcon(tx.category?.name)

        return (
          <div key={tx.id} className="flex items-center gap-3 py-3.5">
            {/* Category icon */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                income ? 'bg-emerald-400/10' : 'bg-rose-400/10'
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  income ? 'text-emerald-400' : 'text-rose-400'
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
                year: 'numeric',
              })}
            </span>

            {/* Status */}
            <StatusPill status={tx.status} />

            {/* Amount */}
            <div className="flex items-center gap-1 min-w-[100px] justify-end">
              {income ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
              )}
              <span
                className={`text-sm font-semibold ${
                  income ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCents(Math.abs(amount), currency)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function TransactionsPage() {
  const { currentHouseholdId, currentHousehold } = useHousehold()
  const currency = currentHousehold?.baseCurrency ?? 'KES'
  const [tab, setTab] = useState<'all' | 'expenses' | 'income'>('all')

  const { data, loading, error } = useQuery<{
    transactions: TransactionItem[]
  }>(TRANSACTIONS_QUERY, { skip: !currentHouseholdId })

  const allTransactions = data?.transactions ?? []
  const expenses = allTransactions.filter((tx) => !isIncome(tx))
  const incomes = allTransactions.filter((tx) => isIncome(tx))

  const tabs = [
    { key: 'all' as const, label: 'All', count: allTransactions.length },
    { key: 'expenses' as const, label: 'Expenses', count: expenses.length },
    { key: 'income' as const, label: 'Income', count: incomes.length },
  ]

  const displayed =
    tab === 'expenses' ? expenses : tab === 'income' ? incomes : allTransactions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your household income and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/transactions/add-expense">
              <Plus className="mr-1.5 h-4 w-4" />
              Expense
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/transactions/add-income">
              <Plus className="mr-1.5 h-4 w-4" />
              Income
            </Link>
          </Button>
        </div>
      </div>

      {!currentHouseholdId && (
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Select a household to view transactions.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
          {error.message}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-1/5 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {currentHouseholdId && !loading && !error && (
        <div className="rounded-xl border bg-card p-6">
          {/* Tab bar */}
          <div className="mb-4 flex gap-1 rounded-lg bg-muted/50 p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}{' '}
                <span className="text-muted-foreground">({t.count})</span>
              </button>
            ))}
          </div>

          <TransactionList transactions={displayed} currency={currency} />
        </div>
      )}
    </div>
  )
}
