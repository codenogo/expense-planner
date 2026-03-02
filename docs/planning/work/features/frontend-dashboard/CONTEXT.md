# Frontend Dashboard — Context

## Summary

React + TypeScript frontend for the Expense Planner, connecting to the existing Go/GraphQL backend. Covers household management, transaction tracking, CSV import, budget planning with rollover, and reporting.

## Decisions

### GraphQL Client: Apollo Client
Apollo Client v3 — mature ecosystem, normalized cache, excellent DevTools. Heavier than alternatives but strongest community support and tooling.

### UI Framework: shadcn/ui + Tailwind CSS
Copy-paste component model built on Radix UI primitives. Full code ownership, no runtime dependency lock-in. CSS variable theming enables dark mode natively.

### Dark Theme: CSS Variables via Tailwind
Tailwind `dark:` variant with CSS custom properties. Single class toggle on `<html>`. Comes free with shadcn/ui's theming system.

### CSV Import UX: Step-by-Step Wizard
1. Upload CSV file
2. Preview first 5 rows
3. Map columns via dropdowns (date, amount, description, category)
4. Confirm and import

Guided flow reduces user errors. Connects to existing `ImportTransactions` mutation.

### Household Invite Flow: Invite Code (Resolved)
Already implemented in plan 08. Owner generates 8-char hex code (7-day expiry), invitee enters code to join.

### Budget Rollover: Carry Forward Surplus
Unspent budget rolls into next month:
```
next_month_budget = base_budget + (prev_budget - prev_spent)
```
Encourages saving and matches real household behavior.

### Budget Progress API: Wire BudgetService to GraphQL
`BudgetService.GetBudgetProgress` is implemented and tested in Go but not exposed via GraphQL. Need to:
1. Add `BudgetProgressEntry` type and `budgetProgress` query to GraphQL schema
2. Wire `BudgetService` into the resolver and main.go
3. Update frontend `BUDGET_PROGRESS_QUERY` to use the new endpoint
4. Feed real `spentCents` data into BudgetCard progress bars

### Bill Form Validation: Client-side amount check
Backend enforces `Positive()` constraint, but the frontend bill form should validate `amount > 0` and `dueDay` in range client-side for immediate UX feedback.

## Constraints

- React 18+ / TypeScript strict
- Vite for build tooling
- Apollo Client v3 for GraphQL
- shadcn/ui + Tailwind CSS v3+
- Backend: Go + entgo + gqlgen (GraphQL at `/query`)
- Auth: JWT (existing middleware)
- Must support dark/light theme toggle

## Related Code

- `cmd/expense-planner/main.go` — app entry, service wiring
- `graph/*.graphqls` — GraphQL schema definitions
- `graph/*resolvers.go` — resolver implementations
- `internal/service/` — business logic (household, transaction, report, import, JWT, budget)
- `internal/service/budget.go` — BudgetService with GetBudgetProgress (implemented, tested, not wired to GraphQL)
- `web/src/pages/budgets/` — budget list, create, bills pages
- `web/src/graphql/budgets.ts` — budget GraphQL operations
- `web/src/components/budgets/` — BudgetCard, BillCard components
