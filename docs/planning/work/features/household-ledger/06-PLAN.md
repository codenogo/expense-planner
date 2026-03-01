# Plan 06: Implement CSV bank statement import with column mapping

## Goal
Implement CSV bank statement import with column mapping

## Tasks

### Task 1: Create CSV parser with configurable column mapping
**Files:** `internal/service/csv_import.go`, `internal/service/csv_import_test.go`
**Action:**
Build a CSV parser that accepts a column mapping config and produces structured import rows. Support both single-amount and split debit/credit column layouts common in Kenyan bank statements.

**Micro-steps:**
- Define ColumnMapping struct: date_col, amount_col, description_col, debit_col (optional), credit_col (optional), date_format
- Define ImportRow struct: date, amount_cents, description, raw_row
- Implement ParseCSV(reader io.Reader, mapping ColumnMapping) -> []ImportRow
- Handle both single-amount and split debit/credit column formats
- Parse dates with configurable format string
- Handle negative amounts as expenses, positive as income
- Write table-driven tests with sample bank CSVs (KCB, Equity, M-PESA statement formats)

**TDD:**
- required: `true`
- failingVerify:
  - `go test ./internal/service/... -run TestParseCSV`
- passingVerify:
  - `go test ./internal/service/... -run TestParseCSV`

**Verify:**
```bash
go test ./internal/service/...
```

**Done when:** [Observable outcome]

### Task 2: Create import preview and commit flow
**Files:** `internal/service/csv_import.go`, `internal/service/csv_import_test.go`
**Action:**
Build import preview (parse + auto-categorize) and commit (create transactions) flow. Include duplicate detection by date+amount+description.

**Micro-steps:**
- Implement PreviewImport: parse CSV, return rows with auto-detected categories (by merchant keyword matching)
- Implement CommitImport: take previewed rows with user-confirmed categories, create transactions via TransactionService
- Skip duplicate detection: check if transaction with same date+amount+description exists
- Return import summary: total imported, skipped duplicates, total amount
- Write tests for preview and commit flows including duplicate skip

**TDD:**
- required: `true`
- failingVerify:
  - `go test ./internal/service/... -run TestImport`
- passingVerify:
  - `go test ./internal/service/... -run TestImport`

**Verify:**
```bash
go test ./internal/service/...
```

**Done when:** [Observable outcome]

### Task 3: Create CSV import GraphQL mutations
**Files:** `graph/schema.graphqls`, `graph/import.resolvers.go`
**Action:**
Wire CSV import through GraphQL with file upload support. Include bank presets for common Kenyan banks.

**Micro-steps:**
- Add GraphQL types: ColumnMapping input, ImportPreviewRow, ImportSummary
- Add mutation: previewCSVImport(file: Upload!, mapping: ColumnMappingInput!, householdID: ID!): [ImportPreviewRow!]!
- Add mutation: commitCSVImport(householdID: ID!, rows: [ImportRowInput!]!): ImportSummary!
- Add query: bankPresets: [BankPreset!]! — returns preset column mappings for KCB, Equity, M-PESA
- Implement resolvers calling csv_import service
- Run gqlgen generate

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./...`
- passingVerify:
  - `go build ./...`
  - `go vet ./...`

**Verify:**
```bash
go build ./...
go vet ./...
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
go build ./...
go test ./...
```

## Commit Message
```
feat(household-ledger): add CSV bank statement import with column mapping
```
