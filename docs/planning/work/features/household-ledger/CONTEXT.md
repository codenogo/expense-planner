# Feature Context: Household Ledger

> A personal-to-shared household expense tracker with pooled income, double-entry accounting hidden behind simple UX, and a dashboard-first web interface.

## Decisions

### Architecture

| Area | Decision | Notes |
|------|----------|-------|
| API | GraphQL via **gqlgen** | Schema-first, codegen, type-safe resolvers |
| Data layer | **ent** + entgql | Entity framework → DB models + GraphQL types from one source |
| Database | **PostgreSQL** | Referential integrity, aggregation for reports |
| Auth | **JWT** (access + refresh) | Stateless access tokens, HTTP-only cookie refresh |
| Frontend | **React + TypeScript** | Apollo/urql for GraphQL client |
| Deploy | Docker-ready, cloud TBD | Containerize from start |

### Data Model

| Area | Decision | Notes |
|------|----------|-------|
| Accounting | **Double-entry ledger** | Hidden from users — they see "add expense", backend creates balanced entries |
| Money | **Integer cents** (int64) | KES 1,500.50 → 150050. No float errors. |
| Currency | **KES** single currency (MVP) | Multi-currency post-MVP |
| Categories | **Hierarchical** with presets | Kenyan household defaults with sub-categories |
| Sharing | **Pooled income** | All income into household. Not IOU/split-based. |

### Preset Categories (Kenyan Household)

```
Food & Groceries
├── Groceries
├── Eating Out
└── Market

Transport
├── Matatu
├── Uber / Bolt
└── Fuel

Rent

Utilities
├── KPLC (Electricity)
├── Water
└── Internet / Wi-Fi

Airtime & Data

Healthcare
├── Hospital / Clinic
├── Pharmacy
└── Insurance (NHIF)

Education
├── School Fees
├── Books & Supplies
└── Courses

Entertainment
├── Going Out
├── Streaming
└── Sports / Gym

Shopping
├── Clothing
├── Electronics
└── Household Items

Savings & Investments
├── M-Shwari / KCB M-PESA
├── SACCO
└── Other Savings

Other
```

### Entry Methods (MVP)

1. **Manual quick-add** — Amount → Category → Description → Date → Submit
2. **CSV bank import** — Upload → Column mapping → Preview → Confirm

## Core Entities (ent schema)

```
User           — id, email, name, password_hash, created_at
Household      — id, name, base_currency, created_at
HouseholdMember — household_id, user_id, role (owner|member), joined_at

Account        — id, household_id, name, type (asset|income|expense|liability), balance_cents
Transaction    — id, household_id, created_by, date, description, status (pending|posted)
TransactionEntry — id, transaction_id, account_id, amount_cents (positive=debit, negative=credit)
  → Invariant: SUM(entries) per transaction = 0

Category       — id, household_id, parent_id, name, icon, color
Tag            — id, household_id, name
Budget         — id, household_id, category_id, month (YYYY-MM), amount_cents, rollover
Rule           — id, household_id, priority, conditions_json, actions_json
RecurringBill  — id, household_id, name, amount_cents, due_day, category_id, status
```

## Tech Stack Summary

```
┌──────────────────────┐     ┌────────────────────────┐
│  React + TypeScript  │────▶│  Go API                │
│  Apollo/urql client  │     │  gqlgen (GraphQL)      │
│  Dashboard-first     │◀────│  ent (ORM/codegen)     │
│  Dark theme          │     │  JWT auth middleware    │
└──────────────────────┘     │  CSV import service    │
                             └───────────┬────────────┘
                                         │
                                         ▼
                             ┌────────────────────────┐
                             │  PostgreSQL             │
                             │  Double-entry ledger    │
                             │  ent auto-migrations    │
                             └────────────────────────┘
```

## Open Questions (resolve during /plan)

- React GraphQL client: Apollo Client vs urql vs Relay?
- CSS framework: Tailwind CSS vs Chakra UI vs shadcn/ui?
- Dashboard dark theme implementation approach?
- CSV column mapping UX — wizard vs drag-and-drop?
- Household invite flow — email link vs invite code?
- Budget rollover behavior — carry forward or reset monthly?

## Next Step

```
/plan household-ledger
```
