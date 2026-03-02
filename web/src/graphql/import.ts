import { gql } from '@apollo/client'

export const BANK_PRESETS_QUERY = gql`
  query BankPresets {
    bankPresets {
      name
      bankCode
      mapping {
        dateCol
        amountCol
        descriptionCol
        debitCol
        creditCol
        dateFormat
        skipRows
      }
    }
  }
`

export const PREVIEW_CSV_MUTATION = gql`
  mutation PreviewCSVImport($csvContent: String!, $mapping: ColumnMappingInput!, $householdID: ID!) {
    previewCSVImport(csvContent: $csvContent, mapping: $mapping, householdID: $householdID) {
      date
      amountCents
      description
      suggestedCategoryID
      suggestedCategoryName
    }
  }
`

export const COMMIT_CSV_MUTATION = gql`
  mutation CommitCSVImport($householdID: ID!, $rows: [ImportRowInput!]!) {
    commitCSVImport(householdID: $householdID, rows: $rows) {
      totalImported
      skippedDuplicates
      totalAmountCents
    }
  }
`
