# Plan 05: Build transaction pages: add expense/income forms and paginated transaction list with filters

## Goal
Build transaction pages: add expense/income forms and paginated transaction list with filters

## Tasks

### Task 1: Create transaction GraphQL operations and add expense form
**CWD:** `web`
**Files:** `web/src/graphql/transactions.ts`, `web/src/pages/transactions/add-expense.tsx`, `web/src/graphql/categories.ts`, `web/src/types/category.ts`, `web/src/components/ui/calendar.tsx`, `web/src/components/ui/popover.tsx`
**Action:**
Create AddExpense form with amount (decimal input converted to cents), category dropdown (from household categories query), description text field, and date picker. Call addExpense mutation on submit. Add shadcn/ui Calendar and Popover for the date picker. Navigate to /transactions on success.

**Micro-steps:**
- Create src/types/category.ts with Category type
- Create src/graphql/categories.ts with query for household categories
- Create src/graphql/transactions.ts with ADD_EXPENSE mutation
- Add shadcn/ui components: calendar, popover for date picker
- Create add-expense.tsx with form: amount, category select, description, date picker
- Amount input: user enters decimal (e.g. 150.00), convert to cents before mutation
- Category select: populated from household categories query
- On success: show toast, redirect to transactions list
- Verify build passes

**TDD:**
- required: `false`
- reason: Form page calling mutation — no isolated business logic

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 2: Create add income form
**CWD:** `web`
**Files:** `web/src/pages/transactions/add-income.tsx`, `web/src/graphql/transactions.ts`
**Action:**
Create AddIncome form mirroring AddExpense layout. Call addIncome mutation. Same fields: amount, category, description, date. Redirect to /transactions on success.

**Micro-steps:**
- Add ADD_INCOME mutation to graphql/transactions.ts
- Create add-income.tsx form mirroring add-expense: amount, category, description, date
- Reuse same UI components (calendar, select, input)
- On success: show toast, redirect to transactions list
- Verify build passes

**TDD:**
- required: `false`
- reason: Form page — mirrors add-expense pattern

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 3: Build transaction list page with filtering
**CWD:** `web`
**Files:** `web/src/pages/transactions/index.tsx`, `web/src/graphql/transactions.ts`, `web/src/components/ui/tabs.tsx`, `web/src/components/ui/toast.tsx`, `web/src/components/ui/toaster.tsx`, `web/src/components/ui/sonner.tsx`
**Action:**
Create transaction list page showing all household transactions in a table. Add tabs to filter: All / Expenses / Income. Each row shows date, description, category, formatted amount (color-coded), and status. Include action buttons for add-expense and add-income. Add Sonner toaster to app shell for notifications.

**Micro-steps:**
- Add shadcn/ui components: tabs, sonner (toast)
- Add TRANSACTIONS_LIST query to graphql/transactions.ts (household transactions with pagination)
- Create transactions/index.tsx listing transactions in a table
- Add tab filter: All, Expenses, Income
- Each row: date, description, category, amount (color-coded), status badge
- Add buttons linking to /transactions/add-expense and /transactions/add-income
- Wire up Sonner toaster in app shell for success toasts
- Verify build passes

**TDD:**
- required: `false`
- reason: List page with query — no isolated logic

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
feat(frontend-dashboard): add expense/income forms and transaction list with filters
```
