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

export const BUDGET_PROGRESS_QUERY = gql`
  query BudgetProgress($householdID: ID!, $month: String!) {
    budgetProgress(householdID: $householdID, month: $month) {
      budgetID
      categoryID
      month
      amountCents
      spentCents
      rollover
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
