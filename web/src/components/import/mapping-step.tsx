import { useState } from 'react'
import type { ColumnMapping } from '@/types/import'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MappingStepProps {
  csvContent: string
  mapping: ColumnMapping
  onMappingChange: (mapping: ColumnMapping) => void
  onContinue: () => void
  onBack: () => void
}

export function MappingStep({ csvContent, mapping, onMappingChange, onContinue, onBack }: MappingStepProps) {
  const [useDebitCredit, setUseDebitCredit] = useState(mapping.debitCol !== null)

  // Parse first few rows for preview
  const lines = csvContent.split('\n').filter((l) => l.trim())
  const previewRows = lines.slice(0, 3).map((line) => line.split(',').map((c) => c.trim()))

  function updateMapping(partial: Partial<ColumnMapping>) {
    onMappingChange({ ...mapping, ...partial })
  }

  function handleModeToggle() {
    if (useDebitCredit) {
      // Switch to single amount
      setUseDebitCredit(false)
      updateMapping({ amountCol: 1, debitCol: null, creditCol: null })
    } else {
      // Switch to debit/credit
      setUseDebitCredit(true)
      updateMapping({ amountCol: null, debitCol: 1, creditCol: 2 })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">CSV Preview</h3>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {previewRows[0]?.map((_, i) => (
                  <TableHead key={i}>Col {i}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, ri) => (
                <TableRow key={ri}>
                  {row.map((cell, ci) => (
                    <TableCell key={ci} className="text-xs">{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date Column</Label>
          <Input
            type="number"
            min={0}
            value={mapping.dateCol}
            onChange={(e) => updateMapping({ dateCol: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Description Column</Label>
          <Input
            type="number"
            min={0}
            value={mapping.descriptionCol}
            onChange={(e) => updateMapping({ descriptionCol: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Amount Mode</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleModeToggle}>
            {useDebitCredit ? 'Switch to Single Amount' : 'Switch to Debit/Credit'}
          </Button>
        </div>

        {useDebitCredit ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Debit Column</Label>
              <Input
                type="number"
                min={0}
                value={mapping.debitCol ?? 0}
                onChange={(e) => updateMapping({ debitCol: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Credit Column</Label>
              <Input
                type="number"
                min={0}
                value={mapping.creditCol ?? 0}
                onChange={(e) => updateMapping({ creditCol: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Amount Column</Label>
            <Input
              type="number"
              min={0}
              value={mapping.amountCol ?? 0}
              onChange={(e) => updateMapping({ amountCol: parseInt(e.target.value) || 0 })}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date Format</Label>
          <Input
            value={mapping.dateFormat}
            onChange={(e) => updateMapping({ dateFormat: e.target.value })}
            placeholder="02/01/2006"
          />
        </div>
        <div className="space-y-2">
          <Label>Skip Rows (header)</Label>
          <Input
            type="number"
            min={0}
            value={mapping.skipRows}
            onChange={(e) => updateMapping({ skipRows: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onContinue}>Preview Import</Button>
      </div>
    </div>
  )
}
