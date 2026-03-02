export interface Transaction {
  id: string
  description: string
  date: string
  status: 'pending' | 'posted'
  createdAt: string
  entries: TransactionEntry[]
  category: { id: string; name: string } | null
}

export interface TransactionEntry {
  id: string
  amountCents: number
  account: {
    id: string
    name: string
    type: string
  }
}
