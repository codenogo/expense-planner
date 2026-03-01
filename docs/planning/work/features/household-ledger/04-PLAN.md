# Plan 04: Implement double-entry transaction system with expense/income GraphQL mutations

## Goal
Implement double-entry transaction system with expense/income GraphQL mutations

## Tasks

### Task 1: Create Transaction and TransactionEntry ent schemas
**Files:** `ent/schema/transaction.go`, `ent/schema/transaction_entry.go`
**Action:**
Define Transaction (journal header) and TransactionEntry (journal legs) entities. Every transaction has entries that sum to zero (double-entry invariant).

**Micro-steps:**
- Create ent/schema/transaction.go: description, date (time.Time), status enum (pending|posted), created_at
- Add edges: Transaction -> Household, Transaction -> User (created_by), Transaction -> TransactionEntries, Transaction -> Category (optional, for UX), Transaction -> Tags
- Create ent/schema/transaction_entry.go: amount_cents (int64, positive=debit, negative=credit)
- Add edges: TransactionEntry -> Transaction, TransactionEntry -> Account
- Add entgql annotations on both
- Run go generate ./ent

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./...`
- passingVerify:
  - `go build ./...`

**Verify:**
```bash
go generate ./ent
go build ./...
```

**Done when:** [Observable outcome]

### Task 2: Create transaction service with double-entry logic
**Files:** `internal/service/transaction.go`, `internal/service/transaction_test.go`
**Action:**
Implement the core transaction service that abstracts double-entry accounting. User says 'spent 500 on groceries' -> service creates balanced journal entries. All mutations wrapped in DB transactions.

**Micro-steps:**
- Create TransactionService struct with ent.Client dependency
- Implement AddExpense(ctx, householdID, userID, amount, categoryID, description, date): creates Transaction + 2 entries (debit expense account, credit asset account)
- Implement AddIncome(ctx, householdID, userID, amount, categoryID, description, date): creates Transaction + 2 entries (debit asset account, credit income account)
- Validate double-entry invariant: assert sum of entries = 0
- Update account balances atomically within ent transaction
- Write table-driven tests: add expense, add income, verify balances, verify entry sums

**TDD:**
- required: `true`
- failingVerify:
  - `go test ./internal/service/...`
- passingVerify:
  - `go test ./internal/service/...`

**Verify:**
```bash
go test ./internal/service/...
```

**Done when:** [Observable outcome]

### Task 3: Create expense/income GraphQL mutations
**Files:** `graph/schema.graphqls`, `graph/transaction.resolvers.go`
**Action:**
Wire expense and income entry through GraphQL. User-facing mutations accept simple inputs; resolvers call TransactionService which handles double-entry internally.

**Micro-steps:**
- Add AddExpenseInput type to schema: amount (Int, in cents), categoryID, description, date, accountID (optional, defaults to main asset), tags (optional)
- Add AddIncomeInput type to schema: amount, categoryID, description, date, accountID (optional)
- Add mutations: addExpense(input: AddExpenseInput!): Transaction!, addIncome(input: AddIncomeInput!): Transaction!
- Add query: transactions(householdID, first, after, filters): TransactionConnection!
- Implement resolvers calling TransactionService
- Enforce auth middleware: require authenticated user with household membership
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
feat(household-ledger): add double-entry transaction system with expense/income mutations
```
