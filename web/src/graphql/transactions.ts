import { gql } from '@apollo/client'

export const ADD_EXPENSE_MUTATION = gql`
  mutation AddExpense($input: AddExpenseInput!) {
    addExpense(input: $input) {
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
`

export const ADD_INCOME_MUTATION = gql`
  mutation AddIncome($input: AddIncomeInput!) {
    addIncome(input: $input) {
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
`

export const TRANSACTIONS_QUERY = gql`
  query Transactions {
    transactions {
      id
      description
      date
      status
      createdAt
      entries {
        id
        amountCents
        account {
          id
          name
          type
        }
      }
      category {
        id
        name
      }
    }
  }
`
