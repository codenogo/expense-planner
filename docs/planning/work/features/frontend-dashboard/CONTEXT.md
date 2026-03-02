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
- `internal/service/` — business logic (household, transaction, report, import, JWT)
