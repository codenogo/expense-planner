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

export const CREATE_BUDGET_MUTATION = gql`
  mutation CreateBudget($input: CreateBudgetInput!) {
    createBudget(input: $input) {
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
