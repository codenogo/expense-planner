# Plan 10: Fix IDOR vulnerabilities in report resolvers and PreviewCSVImport resolver by adding household membership authorization checks.

## Goal
Fix IDOR vulnerabilities in report resolvers and PreviewCSVImport resolver by adding household membership authorization checks.

## Tasks

### Task 1: Add household membership check to report resolvers
**Files:** `graph/report.resolvers.go`
**Action:**
In graph/report.resolvers.go, replace the auth-only pattern in all 3 resolvers (SpendingByCategory, MonthlyTrend, DashboardSummary). Each currently does: uc := middleware.UserFromContext(ctx); if uc == nil { return nil, fmt.Errorf("authentication required") }. Replace with the pattern from budget.resolvers.go:17-31: _, hhIDs, err := userHouseholdIDs(ctx, r.Client); if err != nil { return nil, err }; allowed := false; for _, id := range hhIDs { if id == householdID { allowed = true; break } }; if !allowed { return nil, fmt.Errorf("access denied to household %d", householdID) }. Remove the middleware import since userHouseholdIDs handles authentication internally. Keep the fmt import.

**Micro-steps:**
- In SpendingByCategory, replace UserFromContext auth-only check with userHouseholdIDs() call + membership loop
- In MonthlyTrend, apply the same userHouseholdIDs() + membership loop pattern
- In DashboardSummary, apply the same userHouseholdIDs() + membership loop pattern
- Remove unused middleware import if no longer needed (userHouseholdIDs handles auth internally)
- Run go build and go vet to verify compilation
- Run go test to verify existing tests pass

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./...`
- passingVerify:
  - `go build ./...`
  - `go test ./... -short`

**Verify:**
```bash
go build ./...
go vet ./...
go test ./... -short
```

**Done when:** [Observable outcome]

### Task 2: Add household membership check to PreviewCSVImport resolver
**Files:** `graph/import.resolvers.go`
**Action:**
In graph/import.resolvers.go, replace the auth-only check in PreviewCSVImport (lines 23-27) with the userHouseholdIDs pattern: _, hhIDs, err := userHouseholdIDs(ctx, r.Client); if err != nil { return nil, err }; allowed := false; for _, id := range hhIDs { if id == householdID { allowed = true; break } }; if !allowed { return nil, fmt.Errorf("access denied to household %d", householdID) }. Keep all column mapping validation (lines 29-41) and the rest of the function unchanged. The middleware import may still be needed by CommitCSVImport — check before removing.

**Micro-steps:**
- In PreviewCSVImport, replace UserFromContext auth-only check with userHouseholdIDs() call + membership loop
- Keep all existing column mapping validation logic intact after the auth check
- Run go build and go vet to verify compilation
- Run go test to verify existing tests pass

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./...`
- passingVerify:
  - `go build ./...`
  - `go test ./... -short`

**Verify:**
```bash
go build ./...
go vet ./...
go test ./... -short
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
go build ./...
go vet ./...
go test ./... -short
```

## Commit Message
```
fix(frontend-dashboard): add household membership authorization to report and import resolvers
```
