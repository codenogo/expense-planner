# Plan 03: Create Household, Account, and Category entities with hierarchical Kenyan presets

## Goal
Create Household, Account, and Category entities with hierarchical Kenyan presets

## Tasks

### Task 1: Create Household and HouseholdMember ent schemas
**Files:** `ent/schema/household.go`, `ent/schema/household_member.go`, `ent/schema/user.go`
**Action:**
Define Household and HouseholdMember entities. A user creates a household and is automatically added as the owner. Members can be invited later.

**Micro-steps:**
- Create ent/schema/household.go: name, base_currency (default KES), created_at
- Create ent/schema/household_member.go: role enum (owner|member), joined_at
- Add edges: Household -> HouseholdMembers, HouseholdMember -> User, HouseholdMember -> Household
- Add edge from User -> HouseholdMembers
- Add entgql annotations for GraphQL query and mutation generation
- Run go generate ./ent
- Add GraphQL mutation: createHousehold (auto-adds creator as owner member)

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./...`
- passingVerify:
  - `go build ./...`
  - `go vet ./...`

**Verify:**
```bash
go generate ./ent
go build ./...
go vet ./...
```

**Done when:** [Observable outcome]

### Task 2: Create Account ent schema with account types
**Files:** `ent/schema/account.go`
**Action:**
Define Account entity with types for double-entry: asset (bank/cash), income, expense, liability (credit card). Balance stored as int64 cents.

**Micro-steps:**
- Create ent/schema/account.go with fields: name, type enum (asset|income|expense|liability), balance_cents (int64, default 0), created_at
- Add edges: Account -> Household (required), Account -> TransactionEntries (future)
- Add unique index on (household_id, name)
- Add entgql annotations (QueryField, Mutations)
- Run go generate ./ent

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./...`
- passingVerify:
  - `go build ./...`

**Verify:**
```bash
go generate ./ent
go build ./...
```

**Done when:** [Observable outcome]

### Task 3: Create Category ent schema with hierarchical Kenyan presets
**Files:** `ent/schema/category.go`, `internal/seed/categories.go`
**Action:**
Define hierarchical Category entity with parent/children self-reference. Create seeder with Kenyan household expense presets. System categories are non-deletable.

**Micro-steps:**
- Create ent/schema/category.go: name, icon (optional), color (optional), is_system (bool)
- Add self-referential edge: Category -> parent Category, Category -> children Categories
- Add edge: Category -> Household (required)
- Add entgql annotations
- Run go generate ./ent
- Create internal/seed/categories.go with SeedDefaultCategories function
- Define Kenyan household preset tree: Food (Groceries/Eating Out/Market), Transport (Matatu/Uber/Fuel), Rent, Utilities (KPLC/Water/Internet), Airtime & Data, Healthcare (Hospital/Pharmacy/NHIF), Education (School Fees/Books/Courses), Entertainment (Going Out/Streaming/Gym), Shopping (Clothing/Electronics/Household Items), Savings (M-Shwari/SACCO/Other)

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./...`
- passingVerify:
  - `go build ./...`
  - `go vet ./...`

**Verify:**
```bash
go generate ./ent
go build ./...
go vet ./...
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
go build ./...
go vet ./...
```

## Commit Message
```
feat(household-ledger): add Household, Account, and Category entities with Kenyan presets
```
