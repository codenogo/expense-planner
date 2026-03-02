export interface TransactionSummary {
  id: string
  description: string
  date: string
  status: string
  entries: { id: string; amountCents: number }[]
  category: { id: string; name: string } | null
}

export interface DashboardSummary {
  totalBalanceCents: number
  totalIncomeCents: number
  totalSpendingCents: number
  safeToSpendCents: number
  recentTransactions: TransactionSummary[]
}

export interface CategorySpend {
  categoryID: string
  name: string
  totalCents: number
  percentage: number
}

export interface MonthSummary {
  month: string
  incomeCents: number
  expenseCents: number
  netCents: number
}
