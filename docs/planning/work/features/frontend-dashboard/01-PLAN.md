# Plan 01: Scaffold React + Vite + TypeScript project with Tailwind CSS, shadcn/ui, Apollo Client, and app shell layout with dark mode toggle

## Goal
Scaffold React + Vite + TypeScript project with Tailwind CSS, shadcn/ui, Apollo Client, and app shell layout with dark mode toggle

## Tasks

### Task 1: Initialize Vite React TypeScript project with Tailwind and Apollo
**CWD:** `.`
**Files:** `web/package.json`, `web/tsconfig.json`, `web/tsconfig.app.json`, `web/tsconfig.node.json`, `web/vite.config.ts`, `web/index.html`, `web/postcss.config.js`, `web/tailwind.config.ts`, `web/components.json`, `web/src/main.tsx`, `web/src/index.css`, `web/src/vite-env.d.ts`, `web/src/lib/utils.ts`
**Action:**
Create web/ directory with Vite React TypeScript template. Install Apollo Client, React Router, Tailwind CSS, and initialize shadcn/ui. Configure path aliases (@/) in tsconfig and vite. Set up CSS variables for dark/light themes following shadcn/ui conventions.

**Micro-steps:**
- Run npm create vite@latest web -- --template react-ts
- Install dependencies: @apollo/client graphql react-router-dom
- Install Tailwind CSS and PostCSS: tailwindcss postcss autoprefixer
- Run npx tailwindcss init -p to generate config files
- Initialize shadcn/ui: npx shadcn@latest init
- Configure path aliases in tsconfig and vite.config.ts
- Add CSS variables for light/dark theme in index.css
- Create src/lib/utils.ts with cn() helper from shadcn/ui
- Verify dev server starts with npm run dev

**TDD:**
- required: `false`
- reason: Project scaffold — no testable logic yet, verification is build + dev server startup

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 2: Create Apollo Client provider and auth token management
**CWD:** `web`
**Files:** `web/src/lib/apollo.ts`, `web/src/lib/auth.ts`, `web/src/providers/apollo-provider.tsx`
**Action:**
Create Apollo Client instance configured with HttpLink pointing to backend /query endpoint. Add authLink that reads JWT from localStorage and sets Authorization header. Create auth utility (getToken, setTokens, clearTokens). Wrap app in ApolloProvider.

**Micro-steps:**
- Create src/lib/auth.ts with getToken/setTokens/clearTokens using localStorage
- Create src/lib/apollo.ts configuring ApolloClient with HttpLink to /query and auth header from stored token
- Create src/providers/apollo-provider.tsx wrapping children in ApolloProvider
- Update main.tsx to wrap app in ApolloProvider
- Verify build still passes

**TDD:**
- required: `false`
- reason: Provider wiring — verified via successful build and runtime integration in plan 02

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 3: Build app shell layout with sidebar navigation and dark mode toggle
**CWD:** `web`
**Files:** `web/src/components/layout/app-shell.tsx`, `web/src/components/layout/sidebar.tsx`, `web/src/components/layout/header.tsx`, `web/src/components/ui/button.tsx`, `web/src/components/theme-toggle.tsx`, `web/src/providers/theme-provider.tsx`, `web/src/app.tsx`, `web/src/main.tsx`
**Action:**
Create app shell with responsive sidebar navigation (Dashboard, Transactions, Import, Reports, Budgets, Household), header bar, and dark mode toggle. Use shadcn/ui button component. ThemeProvider manages dark class on html element with localStorage persistence. Set up React Router with placeholder routes.

**Micro-steps:**
- Add shadcn/ui button component: npx shadcn@latest add button
- Create ThemeProvider with localStorage persistence and system preference detection
- Create ThemeToggle component using button to switch light/dark/system
- Create Sidebar with nav links: Dashboard, Transactions, Import, Reports, Budgets, Household
- Create Header with app title and theme toggle
- Create AppShell combining sidebar + header + content outlet
- Create App component with React Router and AppShell wrapping route outlet
- Update main.tsx with BrowserRouter, ThemeProvider, ApolloProvider, and App
- Verify build passes and dev server renders shell

**TDD:**
- required: `false`
- reason: UI shell layout — verified via build success and visual inspection of dev server

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
feat(frontend-dashboard): scaffold React app with Vite, Tailwind, shadcn/ui, Apollo, and app shell
```
