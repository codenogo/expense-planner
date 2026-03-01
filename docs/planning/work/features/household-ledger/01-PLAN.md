# Plan 01: Bootstrap ent + gqlgen + PostgreSQL foundation with Docker dev environment

## Goal
Bootstrap ent + gqlgen + PostgreSQL foundation with Docker dev environment

## Tasks

### Task 1: Initialize ent and gqlgen scaffolding
**Files:** `ent/entc.go`, `ent/generate.go`, `ent/schema/.gitkeep`, `gqlgen.yml`, `graph/resolver.go`, `graph/schema.graphqls`, `tools.go`
**Action:**
Set up ent ORM with entgql extension and gqlgen GraphQL server scaffolding. Follow entgo.io official integration guide. Use pgx/v5 as the PostgreSQL driver.

**Micro-steps:**
- Add Go dependencies: ent, entgql, gqlgen, pgx/v5
- Create ent/entc.go with entgql extension (schema generator, config path)
- Create ent/generate.go with go:generate directive
- Create gqlgen.yml with ent autobind and schema paths
- Create graph/resolver.go with Resolver struct holding *ent.Client
- Create graph/schema.graphqls with root Query type and health field
- Create tools.go with blank imports for ent and gqlgen CLI
- Run go mod tidy to resolve all dependencies

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./...`
- passingVerify:
  - `go build ./...`

**Verify:**
```bash
go build ./...
go vet ./...
```

**Done when:** [Observable outcome]

### Task 2: Wire GraphQL server in main.go with PostgreSQL connection
**Files:** `cmd/expense-planner/main.go`, `internal/config/config.go`
**Action:**
Wire the GraphQL server into main.go with PostgreSQL connection, ent client, and auto-migration. Load config from environment variables.

**Micro-steps:**
- Create internal/config/config.go to load DATABASE_URL, PORT, JWT_SECRET from env
- Rewrite cmd/expense-planner/main.go to open PostgreSQL via pgx, create ent client
- Add auto-migration on startup (client.Schema.Create)
- Mount gqlgen handler at /query, playground at /
- Keep /health endpoint
- Add entgql.Transactioner middleware for transaction-wrapped mutations

**TDD:**
- required: `true`
- failingVerify:
  - `go build ./cmd/expense-planner`
- passingVerify:
  - `go build ./cmd/expense-planner`

**Verify:**
```bash
go build ./cmd/expense-planner
go vet ./...
```

**Done when:** [Observable outcome]

### Task 3: Add Docker Compose for PostgreSQL and Dockerfile for the app
**Files:** `docker-compose.yml`, `Dockerfile`, `.env.example`
**Action:**
Create Docker Compose for local PostgreSQL dev environment and a production Dockerfile for the Go app.

**Micro-steps:**
- Create docker-compose.yml with PostgreSQL 16 service (port 5432, volume for data)
- Create .env.example with DATABASE_URL, PORT, JWT_SECRET placeholders
- Create multi-stage Dockerfile (build with Go, run with distroless/static)
- Add .env to .gitignore
- Verify docker compose config is valid

**TDD:**
- required: `false`
- reason: Infrastructure files — verified by docker compose config and go build

**Verify:**
```bash
docker compose config --quiet
go build ./cmd/expense-planner
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
go build ./cmd/expense-planner
go vet ./...
```

## Commit Message
```
feat(household-ledger): bootstrap ent + gqlgen + PostgreSQL foundation
```
