export interface Budget {
  id: string
  month: string          // YYYY-MM format
  amountCents: number
  rollover: boolean
  category: {
    id: string
    name: string
  }
  household: {
    id: string
  }
  spentCents?: number    // computed on client from transactions if needed
}

export interface BudgetProgressEntry {
  budgetID: string
  categoryID: string
  month: string
  amountCents: number
  spentCents: number
  rollover: boolean
}

export interface RecurringBill {
  id: string
  name: string
  amountCents: number
  dueDay: number         // 1-31
  frequency: 'monthly' | 'weekly' | 'annual'
  status: 'pending' | 'paid' | 'overdue'
  createdAt: string
  category?: {
    id: string
    name: string
  } | null
  household: {
    id: string
  }
}
