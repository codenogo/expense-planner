# Brainstorm: Household Expense Tracker

## Context

Build a personal-to-shared household expense tracker in Go. Users range from solo individuals to couples to families. Income is pooled when shared — one household pot, not Splitwise-style IOUs. Web dashboard (inspired by the SOLAR Digital Dribbble design), PostgreSQL, cloud-deployed. MVP uses manual entry + CSV import, single currency.

## Research Highlights

| App | Key Pattern Worth Borrowing |
|-----|----------------------------|
| YNAB | Zero-based budgeting ("give every dollar a job"), budget-before-spend |
| Monarch Money | Auto-categorization rules from manual corrections, net worth tracking |
| Copilot | Per-user ML categorization, ~90% accuracy out of box |
| Lunch Money | Calendar view, developer API, multi-currency native |
| PocketGuard | "Safe-to-spend" single number — reduces cognitive load |
| Splitwise | Debt simplification graph algorithm (not needed here, but settlement is) |
| Honeydue | Per-transaction chat, tiered account visibility |
| Firefly III | Double-entry ledger, rules engine, split transactions |
| Actual Budget | Local-first sync, envelope carry-forward propagation |
| Dribbble ref | Dark dashboard, multi-wallet cards, monthly bills table, P&L chart, spending limit bar |

## Constraints

| Constraint | Detail |
|------------|--------|
| Language | Go (stdlib-first) |
| Database | PostgreSQL |
| Client | Web app (responsive), dashboard-first |
| Entry | Manual + CSV import for MVP |
| Currency | Single base currency for MVP |
| Sharing model | Pooled income household — not IOU/split-based |
| Deploy | Cloud managed (Fly.io, Railway, or similar) |

---

## Candidate A: "Household Ledger" (Recommended)

**Philosophy:** Double-entry household finance. All income pools into the household. Every expense draws from it. Clean, auditable, powerful reporting.

### Who it serves
- Solo users who want structured budgeting
- Couples/families who pool income and share expenses
- Grows from personal → household by adding members

### Architecture sketch
```
┌─────────────┐     ┌─────────────────────┐     ┌──────────────┐
│  Web App    │────▶│  Go API (REST/JSON)  │────▶│  PostgreSQL  │
│  (React/    │     │                      │     │              │
│   Svelte)   │◀────│  JWT auth            │◀────│  Double-     │
└─────────────┘     │  Rules engine        │     │  entry       │
                    │  CSV importer        │     │  ledger      │
                    │  Budget evaluator    │     └──────────────┘
                    └─────────────────────┘
```

### Data model (core)
```
Household: id, name, base_currency, created_at
User: id, email, name, password_hash
HouseholdMember: household_id, user_id, role (owner|member)

Account: id, household_id, name, type (checking|savings|credit|cash|income|expense), balance
Transaction: id, household_id, created_by, date, description, status
TransactionEntry: id, transaction_id, account_id, amount (positive=debit, negative=credit)
  -- Always balanced: SUM(entries) per transaction = 0

Category: id, household_id, parent_id, name, icon, budget_amount
Tag: id, household_id, name
Rule: id, household_id, priority, conditions, actions
Budget: id, household_id, category_id, month, amount, rollover
RecurringPattern: id, household_id, merchant, amount_range, period_days
```

### In-scope (MVP)
- User auth (signup, login, JWT)
- Household creation + member invites
- Manual expense/income entry
- CSV bank statement import
- Categories (preset + custom, hierarchical)
- Tags
- Monthly budgets per category with progress bars
- Dashboard: total balance, income vs spending, category breakdown, recent transactions
- Monthly spending limit (visual bar like Dribbble ref)
- Monthly bills tracker (recurring expenses with status: paid/pending/overdue)
- Basic reports: spending by category, income vs expense trend

### Out-of-scope (MVP)
- Bank sync (Plaid) — future
- Receipt OCR — future
- Multi-currency — future
- Mobile app — future (responsive web covers phone)
- AI auto-categorization — future (start with rules)
- Investment/net worth tracking — future

### Risks + mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Double-entry complexity for casual users | Users confused by accounting model | Abstract away in UI — user sees "add expense", backend handles entries |
| Household permission model | Privacy concerns between members | Role-based access: owner manages settings, members enter/view |
| CSV import variance | Every bank has different formats | Configurable column mapping UI, ship with common bank presets |

### MVP slice (2 phases)
**Phase 1 — Solo tracker:**
1. Auth (signup/login)
2. Manual expense/income entry
3. Categories + tags
4. Dashboard (balance, spending summary, recent transactions)
5. Monthly budget tracking

**Phase 2 — Household mode:**
6. Household creation + invites
7. Shared dashboard (pooled income view)
8. CSV import with column mapping
9. Monthly bills tracker
10. Rules engine (auto-categorize by merchant name)
11. Reports (category breakdown, monthly trends)

---

## Candidate B: "Flex Wallet"

**Philosophy:** Multi-wallet system where each user has personal wallets AND shared household wallets. More flexible but more complex. Inspired by Monarch Money's joint+separate model.

### Who it serves
- Couples who keep some finances separate
- Users who want wallet-level control (USD wallet, savings wallet, joint wallet)

### Architecture sketch
Same as Candidate A, but the data model centers on wallets rather than a single household pot.

### Key difference from A
```
Wallet: id, household_id, owner_user_id (null=shared), name, type, visibility (full|balance|hidden)
Transaction: id, wallet_id, ...
```

Each transaction belongs to a specific wallet. Shared wallets pool income. Personal wallets are private. Dashboard shows both personal and shared views.

### In-scope (MVP)
Same as A, plus:
- Multiple wallets per user (cash, checking, savings, credit card)
- Per-wallet visibility tiers (shared wallets show to all, personal wallets private)
- Transfer between wallets (not counted as income/expense)
- Multi-wallet dashboard cards (like Dribbble ref: USD, EUR, GBP cards)

### Out-of-scope (MVP)
Same as A.

### Risks + mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Wallet sprawl | Too many wallets confuse UX | Default to 1 shared wallet, let users add more optionally |
| Reporting across wallets | Aggregation complexity | Unified reporting that rolls up across all wallets |
| Privacy model complexity | Edge cases in "who sees what" | Ship with 2 modes only: shared (everyone sees) and personal (only owner) |

### MVP slice
Same phases as A, but Phase 1 includes wallet CRUD and Phase 2 adds shared wallets with visibility controls.

---

## Candidate C: "Envelope Budget"

**Philosophy:** Visual envelope budgeting. Income fills envelopes, spending drains them. Simpler mental model than double-entry. Inspired by YNAB/Goodbudget.

### Who it serves
- Users who think in terms of "grocery money" and "fun money"
- Households that allocate fixed amounts to categories each month

### Key difference from A
No formal double-entry. Instead:
```
Envelope: id, household_id, name, allocated_amount, spent_amount, remaining
Transaction: id, envelope_id, amount, description, date
```

Income doesn't go to an account — it fills envelopes. Reporting is envelope-centric.

### Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Limited audit trail | No double-entry means less financial rigor | Acceptable for household use |
| Hard to add multi-account later | Envelopes don't map to bank accounts | Would need significant refactor |
| No transfer tracking | Can't model money moving between accounts | Not needed if pure budget tool |

### MVP slice
Simpler than A — fewer entities, faster to build. But significantly less extensible.

---

## Recommendation

### Primary: Candidate A — "Household Ledger"

**Why:**
1. **Double-entry is the right foundation.** It sounds complex but it's abstracted from the user. The API receives "I spent $50 on groceries" and creates the two entries automatically. The benefit is that all reporting, budgeting, and balance tracking are consistent and auditable by construction.
2. **Pooled income model is native.** Income transactions credit the household income account and debit the shared asset account. Every member sees the same pool. This matches the user's stated model exactly.
3. **Extensible.** When multi-currency, bank sync, or investment tracking are added later, double-entry handles them without a schema rewrite.
4. **Phase 1 is a standalone solo tracker.** Useful immediately even before household features ship.

### Backup: Candidate B — "Flex Wallet"

**Why backup:** If user testing reveals that people want separate finances alongside shared ones (couples who "split rent but keep everything else separate"), the wallet model handles this better. Can be evolved from A by adding wallet entities on top of the ledger.

### Not recommended: Candidate C

**Why not:** Too limited. The envelope model can't grow into multi-account, transfers, or financial reporting without a rewrite. It trades short-term simplicity for long-term dead ends.

---

## Next Step

```
/discuss "Household Ledger"
```
