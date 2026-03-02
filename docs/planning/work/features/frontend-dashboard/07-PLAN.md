# Plan 07: Build reports pages: spending by category with date range filter and monthly trend line chart

## Goal
Build reports pages: spending by category with date range filter and monthly trend line chart

## Tasks

### Task 1: Build spending by category report page
**CWD:** `web`
**Files:** `web/src/pages/reports/index.tsx`, `web/src/pages/reports/spending.tsx`, `web/src/graphql/reports.ts`, `web/src/components/ui/date-picker.tsx`
**Action:**
Create reports landing page. Build SpendingByCategory page with date range pickers (default: current month). Show horizontal bar chart of spending per category using recharts. Display table with category name, total amount, and percentage. Handle empty state.

**Micro-steps:**
- Create reports/index.tsx as reports landing with links to sub-reports
- Add SPENDING_BY_CATEGORY query with date range params to graphql/reports.ts
- Create spending.tsx with start/end date pickers for custom date range
- Display results as a bar chart (recharts) + table below with category, amount, percentage
- Default date range: current month
- Handle empty state: no expenses in range
- Verify build passes

**TDD:**
- required: `false`
- reason: Report page with chart — visual output, verified via build

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 2: Build monthly trend report page
**CWD:** `web`
**Files:** `web/src/pages/reports/trend.tsx`, `web/src/graphql/reports.ts`
**Action:**
Create MonthlyTrend page with month selector (3/6/12). Display line chart with income, expenses, and net lines using recharts. Show summary table below. Use formatCents for amounts.

**Micro-steps:**
- Add MONTHLY_TREND query with months param to graphql/reports.ts
- Create trend.tsx with month count selector (3, 6, 12 months)
- Display line chart with 3 lines: income (green), expenses (red), net (blue)
- Show data table below chart with month, income, expenses, net columns
- Format amounts using formatCents helper
- Handle loading and error states
- Verify build passes

**TDD:**
- required: `false`
- reason: Chart page — visual output, no business logic

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 3: Wire report routes and add navigation
**CWD:** `web`
**Files:** `web/src/app.tsx`, `web/src/components/layout/sidebar.tsx`
**Action:**
Wire report routes in App router. Update sidebar to show report sub-navigation (Spending by Category, Monthly Trend). Ensure navigation between report pages works.

**Micro-steps:**
- Add report routes to App: /reports, /reports/spending, /reports/trend
- Update sidebar Reports link to expand showing sub-links: Spending, Trend
- Add breadcrumb or back navigation on report sub-pages
- Verify build passes and all routes are accessible

**TDD:**
- required: `false`
- reason: Route wiring — no logic to test

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
feat(frontend-dashboard): add spending by category and monthly trend report pages
```
