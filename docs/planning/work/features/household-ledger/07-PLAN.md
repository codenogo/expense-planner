# Plan 07: Implement reports and dashboard summary queries

## Goal
Implement reports and dashboard summary queries

## Tasks

### Task 1: Create spending-by-category aggregation query
**Files:** `internal/service/reports.go`, `internal/service/reports_test.go`
**Action:**
Aggregate expense entries by category for a date range. Returns category name, total spent, and percentage of overall spending.

**Micro-steps:**
- Create ReportService struct with ent.Client dependency
- Implement SpendingByCategory(ctx, householdID, startDate, endDate): returns []CategorySpend{categoryID, name, total_cents, percentage}
- Query: sum transaction entries grouped by category within date range, only expense-type entries
- Calculate percentage of total for each category
- Sort by total descending
- Write tests with multiple categories and transactions

**TDD:**
- required: `true`
- failingVerify:
  - `go test ./internal/service/... -run TestSpendingByCategory`
- passingVerify:
  - `go test ./internal/service/... -run TestSpendingByCategory`

**Verify:**
```bash
go test ./internal/service/...
```

**Done when:** [Observable outcome]

### Task 2: Create income vs expense monthly trend query
**Files:** `internal/service/reports.go`, `internal/service/reports_test.go`
**Action:**
Calculate income, expense, and net totals per month for the last N months. Months with no data return zeros. Used for the P&L bar chart.

**Micro-steps:**
- Implement MonthlyTrend(ctx, householdID, months int): returns []MonthSummary{month, income_cents, expense_cents, net_cents}
- Query: sum income entries and expense entries per month for the last N months
- Calculate net (income - expense) per month
- Return sorted by month ascending
- Write tests covering months with no data (should return zeros)

**TDD:**
- required: `true`
- failingVerify:
  - `go test ./internal/service/... -run TestMonthlyTrend`
- passingVerify:
  - `go test ./internal/service/... -run TestMonthlyTrend`

**Verify:**
```bash
go test ./internal/service/...
```

**Done when:** [Observable outcome]

### Task 3: Create dashboard summary query and wire all reports to GraphQL
**Files:** `internal/service/reports.go`, `graph/schema.graphqls`, `graph/report.resolvers.go`
**Action:**
Dashboard summary aggregates balance, income, spending, and safe-to-spend for the current month. Wire all report queries through GraphQL.

**Micro-steps:**
- Implement DashboardSummary(ctx, householdID): returns {total_balance_cents, total_income_cents (this month), total_spending_cents (this month), safe_to_spend_cents, recent_transactions[]}
- total_balance = sum of all asset account balances
- safe_to_spend = total_balance - sum of remaining budget commitments
- recent_transactions = last 10 posted transactions
- Add GraphQL types: DashboardSummary, CategorySpend, MonthSummary
- Add queries: dashboardSummary(householdID), spendingByCategory(householdID, startDate, endDate), monthlyTrend(householdID, months)
- Implement resolvers calling ReportService
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
go test ./...
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
feat(household-ledger): add reports and dashboard summary queries
```
