# Plan 03: Build household setup page: create household, invite members, manage members with role updates and removal

## Goal
Build household setup page: create household, invite members, manage members with role updates and removal

## Tasks

### Task 1: Create household GraphQL operations and create-household flow
**CWD:** `web`
**Files:** `web/src/graphql/household.ts`, `web/src/types/household.ts`, `web/src/pages/household/create.tsx`, `web/src/providers/household-provider.tsx`
**Action:**
Define TypeScript types for Household, HouseholdMember, InviteCode. Create GraphQL operations for createHousehold. Build HouseholdProvider to track active household (localStorage + context). Create /household/create page with name form.

**Micro-steps:**
- Create src/types/household.ts with Household, HouseholdMember, InviteCode types
- Create src/graphql/household.ts with CREATE_HOUSEHOLD mutation, queries for user households
- Create HouseholdProvider context to track current selected household ID
- Create household/create.tsx page with name input form
- On success: set current household in context, redirect to dashboard
- Verify build passes

**TDD:**
- required: `false`
- reason: GraphQL types and form page — no isolated logic to unit test

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 2: Build invite code generation and join household UI
**CWD:** `web`
**Files:** `web/src/pages/household/invite.tsx`, `web/src/pages/household/join.tsx`, `web/src/graphql/household.ts`, `web/src/components/ui/dialog.tsx`
**Action:**
Create invite page that calls createInviteCode and displays the code with a copy button. Create join page with text input for entering an invite code. Handle error states: expired, used, already member. Use shadcn/ui Dialog for invite code display.

**Micro-steps:**
- Add shadcn/ui dialog component: npx shadcn@latest add dialog
- Add CREATE_INVITE_CODE and JOIN_HOUSEHOLD mutations to graphql/household.ts
- Create invite.tsx page showing generated code with copy-to-clipboard button
- Create join.tsx page with code input field for joining via invite code
- Handle errors inline: expired code, already used, already a member
- On successful join: update household context, redirect to dashboard
- Verify build passes

**TDD:**
- required: `false`
- reason: UI pages with mutation calls — verified via build

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 3: Build member list with role management and removal
**CWD:** `web`
**Files:** `web/src/pages/household/members.tsx`, `web/src/graphql/household.ts`, `web/src/components/ui/select.tsx`, `web/src/components/ui/alert-dialog.tsx`, `web/src/components/ui/badge.tsx`, `web/src/components/ui/table.tsx`
**Action:**
Create members page with table listing household members. Each row shows name, email, role badge. Owners see: role select dropdown to promote/demote, remove button with AlertDialog confirmation. Wire to updateMemberRole and removeMember mutations. Handle last-owner protection error.

**Micro-steps:**
- Add shadcn/ui components: select, alert-dialog, badge, table
- Add REMOVE_MEMBER and UPDATE_MEMBER_ROLE mutations to graphql/household.ts
- Add query for household members list to graphql/household.ts
- Create members.tsx listing all members in a table with name, email, role badge
- For owners: show role select dropdown (owner/member) calling updateMemberRole
- For owners: show remove button with confirmation dialog calling removeMember
- Handle errors: cannot remove last owner, non-owner rejection
- Verify build passes

**TDD:**
- required: `false`
- reason: UI page with CRUD mutations — verified via build

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
feat(frontend-dashboard): add household setup, invite codes, member management
```
