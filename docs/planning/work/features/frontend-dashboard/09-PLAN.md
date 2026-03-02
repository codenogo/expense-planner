# Plan 09: Wire BudgetService to GraphQL, feed real spent data into BudgetCard, and add client-side bill form validation — addressing all review concerns.

## Goal
Wire BudgetService to GraphQL, feed real spent data into BudgetCard, and add client-side bill form validation — addressing all review concerns.

## Tasks

### Task 1: Wire BudgetService to GraphQL
**Files:** `graph/budget.graphqls`, `graph/resolver.go`, `graph/report.resolvers.go`, `cmd/expense-planner/main.go`, `graph/generated.go`
**Action:**
Create a new graph/budget.graphqls file with a BudgetProgressEntry type (budgetID: ID!, categoryID: ID!, month: String!, amountCents: Int!, spentCents: Int!, rollover: Boolean!) and extend Query with budgetProgress(householdID: ID!, month: String!): [BudgetProgressEntry!]!. Add BudgetSvc *service.BudgetService to graph.Resolver. Run go generate ./graph. Implement the budgetProgress resolver by calling r.BudgetSvc.GetBudgetProgress and mapping service.BudgetProgress to the GraphQL type. In main.go, create budgetSvc := service.NewBudgetService(client) and add BudgetSvc: budgetSvc to the Resolver literal.

**Micro-steps:**
- Create graph/budget.graphqls with BudgetProgressEntry type and budgetProgress query
- Add BudgetSvc field to Resolver struct in graph/resolver.go
- Run go generate ./graph to regenerate generated.go and get resolver stub
- Implement BudgetProgress resolver in graph/report.resolvers.go (or new budget.resolvers.go) calling BudgetSvc.GetBudgetProgress
- Wire NewBudgetService in cmd/expense-planner/main.go and pass to Resolver
- Run go vet and go test to verify

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./...`
- passingVerify:
  - `go build ./...`
  - `go test ./... -short`

**Verify:**
```bash
go build ./...
go vet ./...
go test ./... -short
```

**Done when:** [Observable outcome]

### Task 2: Use budgetProgress query in budget list page
**Files:** `web/src/graphql/budgets.ts`, `web/src/pages/budgets/index.tsx`, `web/src/types/budget.ts`
**Action:**
Add a BUDGET_PROGRESS_QUERY in web/src/graphql/budgets.ts: query BudgetProgress($householdID: ID!, $month: String!) { budgetProgress(householdID: $householdID, month: $month) { budgetID categoryID month amountCents spentCents rollover } }. Add a BudgetProgressEntry TypeScript interface in web/src/types/budget.ts. In web/src/pages/budgets/index.tsx, import and call useQuery for BUDGET_PROGRESS_QUERY with variables {householdID: currentHouseholdId, month: selectedMonth}, skip if no householdId. Build a lookup map from budgetID to spentCents. When rendering BudgetCard, pass spentCents from the progress map instead of budget.spentCents.

**Micro-steps:**
- Add BUDGET_PROGRESS_QUERY to web/src/graphql/budgets.ts
- Add BudgetProgressEntry interface to web/src/types/budget.ts
- In web/src/pages/budgets/index.tsx, call BUDGET_PROGRESS_QUERY with householdID and selectedMonth
- Build a spentMap from progress data keyed by budget ID
- Pass real spentCents from spentMap into BudgetCard props
- Run npm run build to verify

**TDD:**
- required: `false`
- reason: UI page with no component test framework — frontend build is the verification gate

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 3: Add client-side bill form validation
**Files:** `web/src/pages/budgets/bills.tsx`
**Action:**
In web/src/pages/budgets/bills.tsx, add a formError state. In handleSubmit, after parsing amountCents and dueDay, validate: if amountCents <= 0 set error 'Amount must be greater than zero' and return; if dueDay < 1 || dueDay > 31 set error 'Due day must be between 1 and 31' and return. Clear formError on successful validation. Render the error message alongside the existing createError display.

**Micro-steps:**
- In handleSubmit, after parsing amountCents and dueDay, add checks: amountCents <= 0 and dueDay < 1 || dueDay > 31
- Add formError state to show validation messages
- Display error message near the submit button
- Run npm run build to verify

**TDD:**
- required: `false`
- reason: UI form validation — frontend build is the verification gate

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
go build ./...
go vet ./...
go test ./... -short
cd web && npm run build
```

## Commit Message
```
feat(frontend-dashboard): wire BudgetService to GraphQL and add bill form validation
```
