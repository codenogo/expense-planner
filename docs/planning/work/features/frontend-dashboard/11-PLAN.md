# Plan 11: Fix frontend UX warnings: propagate preview category edits, add transaction form validation feedback, and validate JWT structure before decoding.

## Goal
Fix frontend UX warnings: propagate preview category edits, add transaction form validation feedback, and validate JWT structure before decoding.

## Tasks

### Task 1: Propagate preview category edits to parent wizard state
**Files:** `web/src/components/import/preview-step.tsx`, `web/src/pages/import/index.tsx`
**Action:**
In web/src/components/import/preview-step.tsx, modify the Continue button's onClick handler. Instead of calling onContinue() directly, first merge editedCategories into the rows: const mergedRows = rows.map((row, i) => editedCategories[i] ? { ...row, suggestedCategoryID: editedCategories[i].id, suggestedCategoryName: editedCategories[i].name } : row); then call onPreviewLoaded(mergedRows) followed by onContinue(). This ensures the parent ImportPage state (previewRows) reflects user's category selections before the confirm step reads them. No changes needed to index.tsx — handleConfirm already reads from state.previewRows.suggestedCategoryID.

**Micro-steps:**
- In preview-step.tsx, modify the onContinue call to first merge editedCategories into previewRows
- Create a mergedRows array that applies editedCategories overrides to suggestedCategoryID and suggestedCategoryName
- Call onPreviewLoaded(mergedRows) before onContinue() so parent state has updated categories
- In index.tsx handleConfirm, verify it reads suggestedCategoryID from previewRows (already does — no change needed)
- Run npm run build to verify

**TDD:**
- required: `false`
- reason: UI component with no test framework — frontend build is the verification gate

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 2: Add form validation feedback to transaction forms
**Files:** `web/src/pages/transactions/add-expense.tsx`, `web/src/pages/transactions/add-income.tsx`
**Action:**
In both web/src/pages/transactions/add-expense.tsx and add-income.tsx: Add const [formError, setFormError] = useState<string | null>(null) alongside existing state. In handleSubmit, add setFormError(null) as the first line after e.preventDefault(). Change the silent return on line 52 to: setFormError('Amount must be greater than zero'); return. Before the existing {error && ...} display, add: {formError && <p className="text-sm text-destructive">{formError}</p>}.

**Micro-steps:**
- In add-expense.tsx, add formError state (useState<string | null>(null))
- In handleSubmit, when cents is NaN or <= 0, set formError to 'Amount must be greater than zero' and return
- Clear formError at the start of handleSubmit
- Render formError above the mutation error display
- Apply the same pattern to add-income.tsx
- Run npm run build to verify

**TDD:**
- required: `false`
- reason: UI form validation — frontend build is the verification gate

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 3: Add JWT structure validation before decoding
**Files:** `web/src/providers/auth-provider.tsx`
**Action:**
In web/src/providers/auth-provider.tsx, modify the useEffect (line 28-40). Replace the try block: const parts = token.split('.'); if (parts.length !== 3) { clearTokens(); } else { try { const payload = JSON.parse(atob(parts[1])); setUser({ id: payload.sub, name: payload.name || '', email: payload.email || '', createdAt: '', updatedAt: '' }); } catch { clearTokens(); } }. This adds an explicit structure check before attempting base64 decode.

**Micro-steps:**
- In the useEffect on mount, before atob, split the token and validate parts.length === 3
- If not 3 parts, call clearTokens() and skip decoding
- Run npm run build to verify

**TDD:**
- required: `false`
- reason: Auth provider initialization — frontend build is the verification gate

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
fix(frontend-dashboard): fix preview category propagation, add form validation feedback, validate JWT structure
```
