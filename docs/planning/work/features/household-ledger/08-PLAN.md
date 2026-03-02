# Plan 08: Add household member invite-code flow and member management (remove, role change)

## Goal
Add household member invite-code flow and member management (remove, role change)

## Tasks

### Task 1: Create InviteCode ent schema and run codegen
**Files:** `ent/schema/invite_code.go`, `ent/schema/household.go`
**Action:**
Create a new ent schema for InviteCode that stores household invite codes. Each code is a unique random string with an expiry time, linked to the household and the user who created it. Add the reverse edge on Household. Run ent codegen and verify build.

**Micro-steps:**
- Create ent/schema/invite_code.go with fields: code (string, unique), expires_at (time), used (bool, default false), created_at (time, immutable)
- Add edges: From household (required, unique), From created_by user (required, unique)
- Add entgql annotations for QueryField and MutationCreate
- Add 'invite_codes' edge to Household schema
- Run go generate ./ent to generate ent code
- Run go build ./... to verify compilation

**TDD:**
- required: `false`
- reason: Schema/codegen task — verified by successful go generate and go build

**Verify:**
```bash
go generate ./ent
go build ./...
```

**Done when:** [Observable outcome]

### Task 2: Create HouseholdService with invite/join/manage logic and tests
**Files:** `internal/service/household.go`, `internal/service/household_test.go`
**Action:**
Create HouseholdService with four methods: CreateInviteCode (owner-only, generates random code with 7-day expiry), JoinHousehold (validates code, adds member), RemoveMember (owner-only, prevents removing last owner), UpdateMemberRole (owner-only). Use crypto/rand for code generation. Write table-driven tests using enttest SQLite client.

**Micro-steps:**
- Write test for CreateInviteCode: owner creates code, non-owner rejected
- Run failing test to verify RED
- Implement CreateInviteCode: verify caller is owner, generate crypto-random 8-char code, store with 7-day expiry
- Run passing test to verify GREEN
- Write test for JoinHousehold: valid code joins, expired code rejected, already-member rejected
- Run failing test to verify RED
- Implement JoinHousehold: validate code, check not expired/used, check not already member, create HouseholdMember, mark code used
- Run passing test to verify GREEN
- Write test for RemoveMember: owner removes member, non-owner rejected, cannot remove self as last owner
- Run failing test to verify RED
- Implement RemoveMember: verify caller is owner, prevent removing last owner, delete membership
- Run passing test to verify GREEN
- Write test for UpdateMemberRole: owner promotes/demotes, non-owner rejected
- Run failing test to verify RED
- Implement UpdateMemberRole: verify caller is owner, update role
- Run passing test to verify GREEN

**TDD:**
- required: `true`
- failingVerify:
  - `go test -count=1 -run TestHousehold ./internal/service/...`
- passingVerify:
  - `go test -count=1 -run TestHousehold ./internal/service/...`

**Verify:**
```bash
go test -count=1 -run TestHousehold ./internal/service/...
```

**Done when:** [Observable outcome]

### Task 3: Wire member management to GraphQL mutations and resolvers
**Files:** `graph/member.graphqls`, `graph/member.resolvers.go`, `graph/resolver.go`, `cmd/expense-planner/main.go`
**Action:**
Create member.graphqls with four mutations. Add HouseholdSvc to Resolver. Run gqlgen generate. Implement resolvers that extract UserFromContext, call HouseholdService methods, and return results. Wire service in main.go.

**Micro-steps:**
- Create graph/member.graphqls with mutations: createInviteCode(householdID), joinHousehold(code), removeMember(householdID, userID), updateMemberRole(householdID, userID, role)
- Add HouseholdSvc field to Resolver struct in resolver.go
- Run gqlgen generate to scaffold resolvers
- Implement resolver methods calling HouseholdService with auth checks
- Wire HouseholdService in main.go
- Run go build ./... and go test -count=1 ./... to verify

**TDD:**
- required: `false`
- reason: Thin resolver layer delegating to tested service — verified by build + full test suite

**Verify:**
```bash
go build ./...
go vet ./...
go test -count=1 ./...
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
go build ./...
go vet ./...
go test -count=1 ./...
```

## Commit Message
```
feat(household-ledger): add member invite-code flow and household management
```
