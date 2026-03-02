import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { COMMIT_CSV_MUTATION } from '@/graphql/import'
import { useHousehold } from '@/providers/household-provider'
import { UploadStep } from '@/components/import/upload-step'
import { MappingStep } from '@/components/import/mapping-step'
import { PreviewStep } from '@/components/import/preview-step'
import { ConfirmStep } from '@/components/import/confirm-step'
import type { ColumnMapping, ImportPreviewRow, ImportRowInput, ImportSummary } from '@/types/import'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type WizardStep = 'upload' | 'mapping' | 'preview' | 'confirm'

interface WizardState {
  csvContent: string
  mapping: ColumnMapping
  previewRows: ImportPreviewRow[]
  step: WizardStep
}

const defaultMapping: ColumnMapping = {
  dateCol: 0,
  amountCol: 1,
  descriptionCol: 2,
  debitCol: null,
  creditCol: null,
  dateFormat: '02/01/2006',
  skipRows: 1,
}

export function ImportPage() {
  const { currentHouseholdId } = useHousehold()

  const [state, setState] = useState<WizardState>({
    csvContent: '',
    mapping: defaultMapping,
    previewRows: [],
    step: 'upload',
  })

  const [commitImport, { loading: committing, error: commitError, data: commitData }] = useMutation<
    { commitCSVImport: ImportSummary },
    { householdID: string; rows: ImportRowInput[] }
  >(COMMIT_CSV_MUTATION)

  function handleFileUploaded(csvContent: string, mapping?: ColumnMapping) {
    setState((prev) => ({
      ...prev,
      csvContent,
      mapping: mapping ?? prev.mapping,
      step: 'mapping',
    }))
  }

  function handleMappingChange(mapping: ColumnMapping) {
    setState((prev) => ({ ...prev, mapping }))
  }

  function goToStep(step: WizardStep) {
    setState((prev) => ({ ...prev, step }))
  }

  function handlePreviewLoaded(rows: ImportPreviewRow[]) {
    setState((prev) => ({ ...prev, previewRows: rows }))
  }

  function handleConfirm() {
    if (!currentHouseholdId) return

    const rows: ImportRowInput[] = state.previewRows.map((row) => ({
      date: row.date,
      amountCents: row.amountCents,
      description: row.description,
      categoryID: row.suggestedCategoryID ?? '',
    }))

    commitImport({
      variables: {
        householdID: currentHouseholdId,
        rows,
      },
    })
  }

  const stepLabels: Record<WizardStep, string> = {
    upload: 'Upload CSV',
    mapping: 'Map Columns',
    preview: 'Preview',
    confirm: 'Confirm',
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Import Transactions</CardTitle>
          <div className="flex gap-2 mt-2">
            {(['upload', 'mapping', 'preview', 'confirm'] as WizardStep[]).map((s, i) => (
              <div
                key={s}
                className={`text-xs px-2 py-1 rounded ${
                  s === state.step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}. {stepLabels[s]}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {state.step === 'upload' && (
            <UploadStep onComplete={handleFileUploaded} />
          )}
          {state.step === 'mapping' && (
            <MappingStep
              csvContent={state.csvContent}
              mapping={state.mapping}
              onMappingChange={handleMappingChange}
              onContinue={() => goToStep('preview')}
              onBack={() => goToStep('upload')}
            />
          )}
          {state.step === 'preview' && (
            <PreviewStep
              csvContent={state.csvContent}
              mapping={state.mapping}
              previewRows={state.previewRows}
              onPreviewLoaded={handlePreviewLoaded}
              onContinue={() => goToStep('confirm')}
              onBack={() => goToStep('mapping')}
            />
          )}
          {state.step === 'confirm' && (
            <ConfirmStep
              previewRows={state.previewRows}
              onConfirm={handleConfirm}
              onBack={() => goToStep('preview')}
              loading={committing}
              result={commitData?.commitCSVImport ?? null}
              error={commitError?.message ?? null}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
