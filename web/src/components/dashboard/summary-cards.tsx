import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCents } from '@/lib/format'

interface SummaryCardsProps {
  totalBalanceCents: number
  totalIncomeCents: number
  totalSpendingCents: number
  safeToSpendCents: number
  currency?: string
}

export function SummaryCards({
  totalBalanceCents,
  totalIncomeCents,
  totalSpendingCents,
  safeToSpendCents,
  currency = 'KES',
}: SummaryCardsProps) {
  const cards = [
    { title: 'Total Balance', value: totalBalanceCents, className: '' },
    { title: 'Income This Month', value: totalIncomeCents, className: 'text-green-600' },
    { title: 'Spending This Month', value: totalSpendingCents, className: 'text-red-600' },
    { title: 'Safe to Spend', value: safeToSpendCents, className: 'text-blue-600' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.className}`}>
              {formatCents(card.value, currency)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
