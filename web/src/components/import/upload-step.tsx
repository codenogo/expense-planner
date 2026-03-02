import { useState, useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import { BANK_PRESETS_QUERY } from '@/graphql/import'
import type { BankPreset, ColumnMapping } from '@/types/import'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UploadStepProps {
  onComplete: (csvContent: string, mapping?: ColumnMapping) => void
}

export function UploadStep({ onComplete }: UploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [csvContent, setCsvContent] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  const { data: presetsData } = useQuery<{ bankPresets: BankPreset[] }>(BANK_PRESETS_QUERY)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      setCsvContent(text)
    }
    reader.readAsText(file)
  }

  function handleContinue() {
    if (!csvContent) return
    const preset = presetsData?.bankPresets.find((p) => p.bankCode === selectedPreset)
    onComplete(csvContent, preset?.mapping)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Bank Preset (optional)</Label>
        <Select value={selectedPreset} onValueChange={setSelectedPreset}>
          <SelectTrigger>
            <SelectValue placeholder="Select bank format" />
          </SelectTrigger>
          <SelectContent>
            {presetsData?.bankPresets.map((preset) => (
              <SelectItem key={preset.bankCode} value={preset.bankCode}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>CSV File</Label>
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          {fileName ? (
            <p className="font-medium">{fileName}</p>
          ) : (
            <p className="text-muted-foreground">Click to select a CSV file</p>
          )}
        </div>
      </div>

      <Button onClick={handleContinue} disabled={!csvContent}>
        Continue
      </Button>
    </div>
  )
}
