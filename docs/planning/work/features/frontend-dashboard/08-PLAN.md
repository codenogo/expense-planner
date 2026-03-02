# Plan 08: Build budget management page with carry-forward rollover and recurring bills tracker

## Goal
Build budget management page with carry-forward rollover and recurring bills tracker

## Tasks

### Task 1: Create budget GraphQL operations and budget list page
**CWD:** `web`
**Files:** `web/src/graphql/budgets.ts`, `web/src/types/budget.ts`, `web/src/pages/budgets/index.tsx`, `web/src/components/budgets/budget-card.tsx`, `web/src/components/ui/progress.tsx`
**Action:**
Define budget types and GraphQL operations. Create BudgetCard with category, amount, spent, remaining, and color-coded progress bar. Show rollover badge when enabled. Build budget list page for current month with add-budget action.

**Micro-steps:**
- Create src/types/budget.ts with Budget, RecurringBill types
- Create src/graphql/budgets.ts with queries for household budgets and mutations for create/update
- Add shadcn/ui progress component: npx shadcn@latest add progress
- Create BudgetCard showing: category name, budget amount, spent amount, remaining, progress bar
- Color progress bar: green (<75%), yellow (75-90%), red (>90%)
- Show rollover indicator when budget has carry-forward enabled
- Create budgets/index.tsx listing current month budgets with add-budget button
- Verify build passes

**TDD:**
- required: `false`
- reason: UI components with query data — no isolated logic

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 2: Build create/edit budget form with rollover toggle
**CWD:** `web`
**Files:** `web/src/pages/budgets/create.tsx`, `web/src/components/ui/switch.tsx`, `web/src/graphql/budgets.ts`
**Action:**
Create budget form with category dropdown, amount input (decimal → cents), month picker (YYYY-MM), and rollover toggle switch. Show carry-forward explanation when rollover enabled. Call createBudget mutation. Handle duplicate budget error.

**Micro-steps:**
- Add shadcn/ui switch component: npx shadcn@latest add switch
- Add CREATE_BUDGET and UPDATE_BUDGET mutations to graphql/budgets.ts
- Create budgets/create.tsx form: category select, amount input, month picker, rollover toggle
- Rollover toggle: when enabled, show explanation text about carry-forward surplus
- On submit: call createBudget mutation, redirect to budgets list
- Handle duplicate budget error (same category+month)
- Verify build passes

**TDD:**
- required: `false`
- reason: Form page — mutation call, no isolated logic

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 3: Build recurring bills tracker
**CWD:** `web`
**Files:** `web/src/pages/budgets/bills.tsx`, `web/src/graphql/budgets.ts`, `web/src/components/budgets/bill-card.tsx`
**Action:**
Create recurring bills page listing all household bills. BillCard shows name, amount, due day, frequency, and color-coded status badge. Add create-bill form. Wire route and update sidebar navigation.

**Micro-steps:**
- Add queries and mutations for recurring bills to graphql/budgets.ts
- Create BillCard showing: name, amount, due day, frequency, status badge (pending/paid/overdue)
- Status badge colors: pending=yellow, paid=green, overdue=red
- Create bills.tsx page listing all recurring bills with add-bill button
- Add create bill form (can be inline or dialog): name, amount, due day, frequency, category
- Wire route /budgets/bills in App router
- Update sidebar Budgets link to show sub-links: Monthly Budgets, Recurring Bills
- Verify build passes

**TDD:**
- required: `false`
- reason: UI list page with CRUD — no isolated logic

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
feat(frontend-dashboard): add budget management with rollover and recurring bills tracker
```
