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

export const RECURRING_BILLS_QUERY = gql`
  query RecurringBills {
    recurringBills {
      id
      name
      amountCents
      dueDay
      frequency
      status
      createdAt
      category {
        id
        name
      }
    }
  }
`

export const CREATE_RECURRING_BILL_MUTATION = gql`
  mutation CreateRecurringBill($input: CreateRecurringBillInput!) {
    createRecurringBill(input: $input) {
      id
      name
      amountCents
      dueDay
      frequency
      status
      category {
        id
        name
      }
    }
  }
`
