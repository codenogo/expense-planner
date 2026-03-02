# Plan 02: Implement authentication pages (login, register) with Apollo mutations, protected routes, and token refresh

## Goal
Implement authentication pages (login, register) with Apollo mutations, protected routes, and token refresh

## Tasks

### Task 1: Create auth GraphQL operations and types
**CWD:** `web`
**Files:** `web/src/graphql/auth.ts`, `web/src/types/auth.ts`
**Action:**
Define TypeScript types matching the backend AuthPayload, User, RegisterInput, LoginInput. Create gql-tagged LOGIN_MUTATION, REGISTER_MUTATION, REFRESH_TOKEN_MUTATION.

**Micro-steps:**
- Create src/types/auth.ts with TypeScript types for User, AuthPayload, LoginInput, RegisterInput
- Create src/graphql/auth.ts with gql tagged mutations: LOGIN, REGISTER, REFRESH_TOKEN
- Verify build passes with new types

**TDD:**
- required: `false`
- reason: Type definitions and GraphQL operation strings — no runtime logic to test

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 2: Build login and register pages with form validation
**CWD:** `web`
**Files:** `web/src/pages/login.tsx`, `web/src/pages/register.tsx`, `web/src/components/ui/input.tsx`, `web/src/components/ui/label.tsx`, `web/src/components/ui/card.tsx`
**Action:**
Create Login page with email/password form using Apollo useMutation(LOGIN). On success, store tokens and navigate to /. Create Register page with name/email/password/confirm fields. Client-side validation for email format, password length (min 8), password match. Display mutation errors inline. Use shadcn/ui Card, Input, Label, Button.

**Micro-steps:**
- Add shadcn/ui components: npx shadcn@latest add input label card
- Create Login page with email/password form using useMutation for LOGIN
- On login success: store tokens via setTokens(), redirect to dashboard
- Display GraphQL errors inline below the form
- Create Register page with name/email/password/confirm-password form
- Add client-side validation: email format, password min 8 chars, passwords match
- On register success: store tokens, redirect to dashboard
- Verify build passes

**TDD:**
- required: `false`
- reason: UI form pages — integration tested via build + manual verification against running backend

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 3: Add auth context, protected routes, and token refresh
**CWD:** `web`
**Files:** `web/src/providers/auth-provider.tsx`, `web/src/components/protected-route.tsx`, `web/src/app.tsx`, `web/src/lib/apollo.ts`
**Action:**
Create AuthProvider context managing user state (isAuthenticated, user, login, logout). ProtectedRoute redirects to /login when unauthenticated. Update App to route /login and /register as public, everything else protected. Add token refresh logic to Apollo link chain — on auth error, attempt refreshToken mutation before failing.

**Micro-steps:**
- Create AuthProvider with React context holding user state and isAuthenticated
- AuthProvider reads stored token on mount, decodes user info (or fetches via query)
- Expose login/logout/register methods that update context + stored tokens
- Create ProtectedRoute component that redirects to /login if not authenticated
- Update App routes: /login and /register are public, all others wrapped in ProtectedRoute
- Update Apollo client to add token refresh link that calls REFRESH_TOKEN on 401
- Verify build passes

**TDD:**
- required: `false`
- reason: Auth context and routing — requires browser environment for meaningful testing, verified via build + runtime

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
cd web && npm run build
```

## Commit Message
```
feat(frontend-dashboard): add auth pages with login, register, protected routes, and token refresh
```
