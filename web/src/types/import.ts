export interface ColumnMapping {
  dateCol: number
  amountCol: number | null
  descriptionCol: number
  debitCol: number | null
  creditCol: number | null
  dateFormat: string
  skipRows: number
}

export interface ImportPreviewRow {
  date: string
  amountCents: number
  description: string
  suggestedCategoryID: string | null
  suggestedCategoryName: string
}

export interface ImportSummary {
  totalImported: number
  skippedDuplicates: number
  totalAmountCents: number
}

export interface BankPreset {
  name: string
  bankCode: string
  mapping: ColumnMapping
}

export interface ImportRowInput {
  date: string
  amountCents: number
  description: string
  categoryID: string
}
