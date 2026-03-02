# Plan 06: Build CSV import wizard: upload file, preview rows, map columns with bank presets, and commit import

## Goal
Build CSV import wizard: upload file, preview rows, map columns with bank presets, and commit import

## Tasks

### Task 1: Create import GraphQL operations and file upload step
**CWD:** `web`
**Files:** `web/src/graphql/import.ts`, `web/src/types/import.ts`, `web/src/pages/import/index.tsx`, `web/src/components/import/upload-step.tsx`
**Action:**
Create import wizard container with step management. Build UploadStep with CSV file dropzone, bank preset selector (from bankPresets query). Read file content as text via FileReader. Store in wizard state and advance to next step.

**Micro-steps:**
- Create src/types/import.ts with ColumnMapping, ImportPreviewRow, ImportSummary, BankPreset types
- Create src/graphql/import.ts with BANK_PRESETS query, PREVIEW_CSV mutation, COMMIT_CSV mutation
- Create import/index.tsx as wizard container managing step state (upload → preview → map → confirm)
- Create UploadStep component: file dropzone accepting .csv files, reads file as text
- Show bank preset dropdown (KCB, Equity, M-PESA) to auto-fill column mapping
- On file select: store CSV text content in wizard state, advance to preview
- Verify build passes

**TDD:**
- required: `false`
- reason: File upload UI step — browser File API, no isolated logic

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 2: Build column mapping and preview steps
**CWD:** `web`
**Files:** `web/src/components/import/mapping-step.tsx`, `web/src/components/import/preview-step.tsx`
**Action:**
Create MappingStep showing raw CSV preview and column index selectors (date, amount/debit+credit, description, date format, skip rows). Create PreviewStep calling previewCSVImport mutation, displaying parsed rows with editable category suggestions. Show summary counts.

**Micro-steps:**
- Create MappingStep: show first 3 CSV rows as a raw table for reference
- Add column index dropdowns: date column, amount column (or debit+credit), description column
- Add date format input (default: DD/MM/YYYY → 02/01/2006 Go format)
- Add skip rows input (default: 1 for header)
- Allow switching between single-amount and debit/credit mode
- Create PreviewStep: call previewCSVImport mutation with CSV content + mapping
- Display parsed rows in table: date, description, amount, suggested category
- Allow editing suggested category per row via dropdown
- Show row count and total amount summary
- Verify build passes

**TDD:**
- required: `false`
- reason: Form steps calling mutations — no isolated testable logic

**Verify:**
```bash
cd web && npm run build
```

**Done when:** [Observable outcome]

### Task 3: Build confirm and commit step
**CWD:** `web`
**Files:** `web/src/components/import/confirm-step.tsx`, `web/src/pages/import/index.tsx`
**Action:**
Create ConfirmStep with import summary and confirm button. Call commitCSVImport on confirm. Display result (imported count, skipped duplicates, total amount). Add success state with navigation to transactions. Wire all wizard steps with back/next flow.

**Micro-steps:**
- Create ConfirmStep showing final row summary: total rows, total amount, category breakdown
- Add confirm button calling commitCSVImport mutation with finalized rows
- Display import result: totalImported, skippedDuplicates, totalAmountCents
- Show success state with link to transactions list
- Handle errors: display failed row details if any
- Wire all 4 steps together in import/index.tsx with back/next navigation
- Verify build passes

**TDD:**
- required: `false`
- reason: Final wizard step — mutation call with result display

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
feat(frontend-dashboard): add CSV import wizard with upload, mapping, preview, and commit
```
