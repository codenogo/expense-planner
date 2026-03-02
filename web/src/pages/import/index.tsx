import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { COMMIT_CSV_MUTATION } from '@/graphql/import'
import { useHousehold } from '@/providers/household-provider'
import { UploadStep } from '@/components/import/upload-step'
import { MappingStep } from '@/components/import/mapping-step'
import { PreviewStep } from '@/components/import/preview-step'
import { ConfirmStep } from '@/components/import/confirm-step'
import type { ColumnMapping, ImportPreviewRow, ImportRowInput, ImportSummary } from '@/types/import'
import { Upload, Columns, Eye, CheckCircle2 } from 'lucide-react'

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

const steps: { key: WizardStep; label: string; icon: React.ElementType }[] = [
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'mapping', label: 'Map Columns', icon: Columns },
  { key: 'preview', label: 'Preview', icon: Eye },
  { key: 'confirm', label: 'Confirm', icon: CheckCircle2 },
]

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

  const currentIdx = steps.findIndex((s) => s.key === state.step)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a CSV file to bulk-import transactions
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon
          const isActive = s.key === state.step
          const isDone = i < currentIdx
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`h-px w-6 ${isDone ? 'bg-emerald-400' : 'bg-border'}`} />
              )}
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : isDone
                    ? 'bg-emerald-400/10 text-emerald-400/70'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="rounded-xl border bg-card p-6">
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
      </div>
    </div>
  )
}
