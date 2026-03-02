import { useState } from 'react'
import { UploadStep } from '@/components/import/upload-step'
import type { ColumnMapping } from '@/types/import'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type WizardStep = 'upload' | 'mapping' | 'preview' | 'confirm'

interface WizardState {
  csvContent: string
  mapping: ColumnMapping
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
  const [state, setState] = useState<WizardState>({
    csvContent: '',
    mapping: defaultMapping,
    step: 'upload',
  })

  function handleFileUploaded(csvContent: string, mapping?: ColumnMapping) {
    setState((prev) => ({
      ...prev,
      csvContent,
      mapping: mapping ?? prev.mapping,
      step: 'mapping',
    }))
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Import Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {state.step === 'upload' && (
            <UploadStep onComplete={handleFileUploaded} />
          )}
          {state.step === 'mapping' && (
            <p className="text-muted-foreground">Mapping step coming next...</p>
          )}
          {state.step === 'preview' && (
            <p className="text-muted-foreground">Preview step coming next...</p>
          )}
          {state.step === 'confirm' && (
            <p className="text-muted-foreground">Confirm step coming next...</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
