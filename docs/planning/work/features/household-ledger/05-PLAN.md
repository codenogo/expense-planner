# Plan 05: Add budgets, tags, and recurring bills tracking

## Goal
Add budgets, tags, and recurring bills tracking

## Tasks

### Task 1: Create Budget ent schema with monthly tracking
**Files:** `ent/schema/budget.go`, `internal/service/budget.go`, `internal/service/budget_test.go`
**Action:**
Define Budget entity tied to a category and month. Budget service calculates progress by summing expense entries per category per month. Supports rollover flag for carry-forward.

**Micro-steps:**
- Create ent/schema/budget.go: month (string YYYY-MM), amount_cents (int64), rollover (bool, default false)
- Add edges: Budget -> Household, Budget -> Category
- Add unique index on (household_id, category_id, month)
- Add entgql annotations (QueryField, Mutations)
- Create internal/service/budget.go: GetBudgetProgress(householdID, month) returns category budgets with spent amounts
- Query spent amounts by summing transaction entries for each category in the month
- Write test: create budget, add expenses, verify progress calculation

**TDD:**
- required: `true`
- failingVerify:
  - `go test ./internal/service/...`
- passingVerify:
  - `go test ./internal/service/...`

**Verify:**
```bash
go generate ./ent
go build ./...
go test ./internal/service/...
```

**Done when:** [Observable outcome]

### Task 2: Create Tag ent schema with transaction tagging
**Files:** `ent/schema/tag.go`
**Action:**
Define Tag entity for flexible transaction labeling. Many-to-many relationship with transactions. Tags are household-scoped.

**Micro-steps:**
- Create ent/schema/tag.go: name (string), color (optional string)
- Add edges: Tag -> Household, Tag -> Transactions (many-to-many)
- Add unique index on (household_id, name)
- Add entgql annotations (QueryField, Mutations)
- Update Transaction schema to add Tags edge (many-to-many)
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

### Task 3: Create RecurringBill ent schema with status tracking
**Files:** `ent/schema/recurring_bill.go`, `internal/service/bills.go`
**Action:**
Define RecurringBill entity for monthly bills tracking (rent, KPLC, Netflix). Bills have a due day and status (paid/pending/overdue). Service auto-marks overdue bills.

**Micro-steps:**
- Create ent/schema/recurring_bill.go: name, amount_cents, due_day (int 1-31), frequency enum (monthly|weekly|annual), status enum (paid|pending|overdue)
- Add edges: RecurringBill -> Household, RecurringBill -> Category
- Add entgql annotations
- Create internal/service/bills.go: UpdateBillStatuses(householdID) — marks bills overdue if past due_day and not paid
- Add GraphQL query: recurringBills(householdID) with filtering by status
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

## Verification

After all tasks:
```bash
go build ./...
go test ./...
```

## Commit Message
```
feat(household-ledger): add budgets, tags, and recurring bills
```
