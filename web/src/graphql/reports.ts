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

export const SPENDING_BY_CATEGORY_QUERY = gql`
  query SpendingByCategory($householdID: ID!, $startDate: Time!, $endDate: Time!) {
    spendingByCategory(householdID: $householdID, startDate: $startDate, endDate: $endDate) {
      categoryID
      name
      totalCents
      percentage
    }
  }
`

export const MONTHLY_TREND_QUERY = gql`
  query MonthlyTrend($householdID: ID!, $months: Int!) {
    monthlyTrend(householdID: $householdID, months: $months) {
      month
      incomeCents
      expenseCents
      netCents
    }
  }
`
