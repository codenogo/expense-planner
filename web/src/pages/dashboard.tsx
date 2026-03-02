import { useQuery } from '@apollo/client/react'
import { DASHBOARD_SUMMARY_QUERY } from '@/graphql/reports'
import type { DashboardSummary } from '@/types/reports'
import { useHousehold } from '@/providers/household-provider'
import { GreetingHeader } from '@/components/dashboard/greeting-header'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { SpendingChart } from '@/components/dashboard/spending-chart'
import { SpendingLimit } from '@/components/dashboard/spending-limit'
import { MonthlyBills } from '@/components/dashboard/monthly-bills'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'

export function DashboardPage() {
  const { currentHouseholdId, currentHousehold } = useHousehold()

  const { data, loading, error } = useQuery<{ dashboardSummary: DashboardSummary }>(
    DASHBOARD_SUMMARY_QUERY,
    {
      variables: { householdID: currentHouseholdId },
      skip: !currentHouseholdId,
    }
  )

  if (!currentHouseholdId) {
    return (
      <div>
        <GreetingHeader />
        <p className="text-muted-foreground mt-2">
          Select or create a household to view your dashboard.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <GreetingHeader />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 animate-pulse">
          <div className="lg:col-span-4 rounded-xl border bg-card p-6 h-36" />
          <div className="lg:col-span-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 h-28" />
            ))}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 h-72" />
          <div className="rounded-xl border bg-card p-6 h-72" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <GreetingHeader />
        <p className="text-sm text-destructive mt-2">{error.message}</p>
      </div>
    )
  }

  const summary = data?.dashboardSummary

  return (
    <div className="space-y-6">
      <GreetingHeader />

      {/* Row 1: Summary Cards */}
      {summary && (
        <SummaryCards
          totalBalanceCents={summary.totalBalanceCents}
          totalIncomeCents={summary.totalIncomeCents}
          totalSpendingCents={summary.totalSpendingCents}
          safeToSpendCents={summary.safeToSpendCents}
          currency={currentHousehold?.baseCurrency}
        />
      )}

      {/* Row 2: Chart + Bills — 2-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <SpendingLimit />
          {summary && (
            <RecentTransactions
              transactions={summary.recentTransactions}
              currency={currentHousehold?.baseCurrency}
            />
          )}
        </div>
        <div className="lg:col-span-3 space-y-6">
          <SpendingChart />
          <MonthlyBills />
        </div>
      </div>
    </div>
  )
}
