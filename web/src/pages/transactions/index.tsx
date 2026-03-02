import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { TRANSACTIONS_QUERY } from '@/graphql/transactions'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface TransactionItem {
  id: string
  description: string
  date: string
  status: string
  entries: { id: string; amountCents: number; account: { id: string; name: string; type: string } }[]
  category: { id: string; name: string } | null
}

function getTransactionAmount(tx: TransactionItem): number {
  return tx.entries.reduce((sum, e) => sum + e.amountCents, 0)
}

function isIncome(tx: TransactionItem): boolean {
  return tx.entries.some((e) => e.account.type === 'income') || getTransactionAmount(tx) > 0
}

function TransactionTable({ transactions, currency }: { transactions: TransactionItem[]; currency: string }) {
  if (transactions.length === 0) {
    return <p className="text-muted-foreground py-4">No transactions found</p>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const amount = getTransactionAmount(tx)
            const income = isIncome(tx)

            return (
              <TableRow key={tx.id}>
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{tx.description}</TableCell>
                <TableCell>{tx.category?.name ?? '—'}</TableCell>
                <TableCell className={`text-right font-medium ${income ? 'text-green-600' : 'text-red-600'}`}>
                  {income ? '+' : ''}{formatCents(amount, currency)}
                </TableCell>
                <TableCell>
                  <Badge variant={tx.status === 'posted' ? 'default' : 'secondary'}>
                    {tx.status}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function TransactionsPage() {
  const { currentHouseholdId, currentHousehold } = useHousehold()
  const currency = currentHousehold?.baseCurrency ?? 'KES'

  const { data, loading, error } = useQuery<{ transactions: TransactionItem[] }>(
    TRANSACTIONS_QUERY,
    { skip: !currentHouseholdId }
  )

  const allTransactions = data?.transactions ?? []
  const expenses = allTransactions.filter((tx) => !isIncome(tx))
  const incomes = allTransactions.filter((tx) => isIncome(tx))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/transactions/add-expense">Add Expense</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/transactions/add-income">Add Income</Link>
          </Button>
        </div>
      </div>

      {!currentHouseholdId && (
        <p className="text-muted-foreground">Select a household to view transactions.</p>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {currentHouseholdId && !loading && !error && (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({allTransactions.length})</TabsTrigger>
            <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
            <TabsTrigger value="income">Income ({incomes.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <TransactionTable transactions={allTransactions} currency={currency} />
          </TabsContent>
          <TabsContent value="expenses">
            <TransactionTable transactions={expenses} currency={currency} />
          </TabsContent>
          <TabsContent value="income">
            <TransactionTable transactions={incomes} currency={currency} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
