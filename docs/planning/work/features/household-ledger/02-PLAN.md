# Plan 02: Implement user authentication with JWT (register, login, refresh, middleware)

## Goal
Implement user authentication with JWT (register, login, refresh, middleware)

## Tasks

### Task 1: Create User ent schema with password hashing
**Files:** `ent/schema/user.go`, `internal/service/auth.go`
**Action:**
Define User entity in ent with email uniqueness. Create auth service with bcrypt password hashing. Ensure password_hash is never exposed via GraphQL.

**Micro-steps:**
- Create ent/schema/user.go with fields: name, email (unique), password_hash, created_at, updated_at
- Add entgql annotations (QueryField, Mutations) — exclude password_hash from GraphQL
- Create internal/service/auth.go with HashPassword and CheckPassword using bcrypt
- Run go generate ./ent to generate ent code
- Write test for HashPassword/CheckPassword round-trip

**TDD:**
- required: `true`
- failingVerify:
  - `go test ./internal/service/...`
- passingVerify:
  - `go test ./internal/service/...`

**Verify:**
```bash
go generate ./ent
go build ./...
go test ./internal/service/...
```

**Done when:** [Observable outcome]

### Task 2: Implement JWT token generation and validation
**Files:** `internal/service/jwt.go`, `internal/service/jwt_test.go`
**Action:**
Implement JWT access and refresh token generation/validation using golang-jwt/v5. Access tokens expire in 15 minutes, refresh tokens in 7 days.

**Micro-steps:**
- Add github.com/golang-jwt/jwt/v5 dependency
- Create internal/service/jwt.go with GenerateAccessToken, GenerateRefreshToken, ValidateToken
- Access token: 15 min expiry, contains user_id and email
- Refresh token: 7 day expiry, contains user_id only
- Write table-driven tests for token generation and validation
- Test expired token rejection, invalid signature rejection

**TDD:**
- required: `true`
- failingVerify:
  - `go test ./internal/service/...`
- passingVerify:
  - `go test ./internal/service/...`

**Verify:**
```bash
go test ./internal/service/...
```

**Done when:** [Observable outcome]

### Task 3: Create auth GraphQL mutations and JWT middleware
**Files:** `graph/schema.graphqls`, `graph/auth.resolvers.go`, `internal/middleware/auth.go`
**Action:**
Create GraphQL mutations for register, login, refreshToken. Create auth middleware that extracts JWT and injects user context. Wire into server.

**Micro-steps:**
- Add auth mutations to schema.graphqls: register(input), login(input), refreshToken(token)
- Define RegisterInput, LoginInput, AuthPayload types in schema
- Implement register resolver: validate input, hash password, create user, return tokens
- Implement login resolver: find user by email, check password, return tokens
- Implement refreshToken resolver: validate refresh token, issue new access token
- Create internal/middleware/auth.go: extract JWT from Authorization header, inject user into context
- Wire middleware in main.go
- Run gqlgen generate

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./...`
- passingVerify:
  - `go build ./...`
  - `go vet ./...`

**Verify:**
```bash
go build ./...
go vet ./...
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
go build ./...
go test ./...
```

## Commit Message
```
feat(household-ledger): add user authentication with JWT
```
