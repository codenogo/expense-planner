import { gql } from '@apollo/client'

export const BUDGETS_QUERY = gql`
  query Budgets {
    budgets {
      id
      month
      amountCents
      rollover
      category {
        id
        name
      }
    }
  }
`
