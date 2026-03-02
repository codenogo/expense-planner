# Quick: Add resolver auth guard tests for userHouseholdIDs and membership-loop authorization pattern to close the test coverage gap from the review

## Goal
Add resolver auth guard tests for userHouseholdIDs and membership-loop authorization pattern to close the test coverage gap from the review

## Files
- `internal/middleware/auth.go`
- `graph/resolver_test.go`

## Approach
[Brief description]

## Verify
```bash
go test ./graph/ -v -run TestUserHouseholdIDs
go test ./... -short
```
