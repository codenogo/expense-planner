# Plan 04: Build the main dashboard page with summary cards, spending breakdown chart, and recent transactions list

## Goal
Build the main dashboard page with summary cards, spending breakdown chart, and recent transactions list

## Tasks

### Task 1: Create dashboard GraphQL operations and summary cards
**CWD:** `web`
**Files:** `web/src/graphql/reports.ts`, `web/src/types/reports.ts`, `web/src/pages/dashboard.tsx`, `web/src/components/dashboard/summary-cards.tsx`, `web/src/lib/format.ts`
**Action:**
Define report types and DASHBOARD_SUMMARY query. Create formatCents utility with unit tests. Build SummaryCards with 4 metric cards (total balance, income this month, spending this month, safe-to-spend). Create Dashboard page composing summary cards with loading/error states.

**Micro-steps:**
- Create src/types/reports.ts with DashboardSummary, CategorySpend, MonthSummary types
- Create src/graphql/reports.ts with DASHBOARD_SUMMARY query
- Create src/lib/format.ts with formatCents(cents, currency) helper converting cents to KES display
- Create SummaryCards component: balance, income, spending, safe-to-spend as 4 cards
- Create Dashboard page calling dashboardSummary query and rendering SummaryCards
- Handle loading and error states
- Verify build passes

**TDD:**
- required: `true`
- failingVerify:
  - `cd web && npx vitest run src/lib/format.test.ts`
- passingVerify:
  - `cd web && npx vitest run src/lib/format.test.ts`

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 2: Add spending by category chart to dashboard
**CWD:** `web`
**Files:** `web/src/components/dashboard/spending-chart.tsx`, `web/src/graphql/reports.ts`, `web/src/pages/dashboard.tsx`
**Action:**
Install recharts. Create SpendingChart with a donut chart showing spending by category for current month. Display category names, amounts, and percentages. Add to Dashboard page. Handle empty state gracefully.

**Micro-steps:**
- Install recharts: npm install recharts
- Add SPENDING_BY_CATEGORY query to graphql/reports.ts
- Create SpendingChart component rendering a donut/pie chart of category spending
- Show category name, amount, and percentage in chart legend
- Integrate SpendingChart into Dashboard page below summary cards
- Handle empty state: no expenses yet
- Verify build passes

**TDD:**
- required: `false`
- reason: Chart component — visual output, no isolated logic to unit test

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 3: Add recent transactions list to dashboard
**CWD:** `web`
**Files:** `web/src/components/dashboard/recent-transactions.tsx`, `web/src/types/transaction.ts`, `web/src/pages/dashboard.tsx`
**Action:**
Create RecentTransactions component showing the last 10 transactions from dashboardSummary query (already fetched in task 0). Display date, description, category, and formatted amount. Color-code amounts: green for income, red for expenses. Add to Dashboard page.

**Micro-steps:**
- Create src/types/transaction.ts with Transaction type matching backend schema
- Create RecentTransactions component displaying last 10 transactions from dashboardSummary
- Each row: date, description, category name, amount (color-coded: green income, red expense)
- Use formatCents for amount display
- Integrate into Dashboard page below charts
- Handle empty state: no transactions yet
- Verify build passes

**TDD:**
- required: `false`
- reason: Presentational list component — no business logic to test

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
cd web && npm run build
```

## Commit Message
```
feat(frontend-dashboard): add dashboard page with summary cards, spending chart, and recent transactions
```
