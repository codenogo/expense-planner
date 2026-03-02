import { useQuery } from '@apollo/client/react'
import { DASHBOARD_SUMMARY_QUERY } from '@/graphql/reports'
import type { DashboardSummary } from '@/types/reports'
import { useHousehold } from '@/providers/household-provider'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { SpendingChart } from '@/components/dashboard/spending-chart'
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Select or create a household to view your dashboard.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-destructive mt-2">{error.message}</p>
      </div>
    )
  }

  const summary = data?.dashboardSummary

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {summary && (
        <SummaryCards
          totalBalanceCents={summary.totalBalanceCents}
          totalIncomeCents={summary.totalIncomeCents}
          totalSpendingCents={summary.totalSpendingCents}
          safeToSpendCents={summary.safeToSpendCents}
          currency={currentHousehold?.baseCurrency}
        />
      )}

      <SpendingChart />

      {summary && (
        <RecentTransactions
          transactions={summary.recentTransactions}
          currency={currentHousehold?.baseCurrency}
        />
      )}
    </div>
  )
}
