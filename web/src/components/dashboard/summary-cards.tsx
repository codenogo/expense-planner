import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
} from 'lucide-react'
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
  const statCards = [
    {
      title: 'Income',
      value: totalIncomeCents,
      icon: TrendingUp,
      accent: 'text-emerald-400',
      accentBg: 'bg-emerald-400/10',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Spending',
      value: totalSpendingCents,
      icon: TrendingDown,
      accent: 'text-rose-400',
      accentBg: 'bg-rose-400/10',
      iconColor: 'text-rose-400',
    },
    {
      title: 'Safe to Spend',
      value: safeToSpendCents,
      icon: Wallet,
      accent: 'text-sky-400',
      accentBg: 'bg-sky-400/10',
      iconColor: 'text-sky-400',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
      {/* Large Total Balance Card */}
      <div className="lg:col-span-4 rounded-xl border bg-card p-6 flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-0.5 rounded bg-muted">
            {currency}
          </span>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight lg:text-4xl">
            {formatCents(totalBalanceCents, currency)}
          </p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="lg:col-span-8 grid gap-4 grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border bg-card p-4 flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
              <div className={`rounded-lg p-1.5 ${card.accentBg}`}>
                <card.icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">
                {formatCents(card.value, currency)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
