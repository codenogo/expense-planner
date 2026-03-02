import { gql } from '@apollo/client'

export const DASHBOARD_SUMMARY_QUERY = gql`
  query DashboardSummary($householdID: ID!) {
    dashboardSummary(householdID: $householdID) {
      totalBalanceCents
      totalIncomeCents
      totalSpendingCents
      safeToSpendCents
      recentTransactions {
        id
        description
        date
        status
        entries {
          id
          amountCents
        }
        category {
          id
          name
        }
      }
    }
  }
`
