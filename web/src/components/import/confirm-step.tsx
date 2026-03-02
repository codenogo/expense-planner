import { Link } from 'react-router-dom'
import type { ImportPreviewRow, ImportSummary } from '@/types/import'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ConfirmStepProps {
  previewRows: ImportPreviewRow[]
  onConfirm: () => void
  onBack: () => void
  loading: boolean
  result: ImportSummary | null
  error: string | null
}

export function ConfirmStep({ previewRows, onConfirm, onBack, loading, result, error }: ConfirmStepProps) {
  const { currentHousehold } = useHousehold()
  const currency = currentHousehold?.baseCurrency ?? 'KES'

  if (result) {
    return (
      <div className="space-y-4 text-center">
        <h3 className="text-lg font-medium">Import Complete</h3>
        <div className="space-y-1">
          <p>{result.totalImported} transactions imported</p>
          {result.skippedDuplicates > 0 && (
            <p className="text-muted-foreground">{result.skippedDuplicates} duplicates skipped</p>
          )}
          <p className="font-medium">Total: {formatCents(result.totalAmountCents, currency)}</p>
        </div>
        <Button asChild>
          <Link to="/transactions">View Transactions</Link>
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={onBack}>Back</Button>
      </div>
    )
  }

  const categoryMap = new Map<string, { count: number; totalCents: number }>()
  for (const row of previewRows) {
    const name = row.suggestedCategoryName || 'Uncategorized'
    const existing = categoryMap.get(name) ?? { count: 0, totalCents: 0 }
    categoryMap.set(name, { count: existing.count + 1, totalCents: existing.totalCents + row.amountCents })
  }
  const categories = Array.from(categoryMap.entries()).sort((a, b) => b[1].totalCents - a[1].totalCents)

  const totalCents = previewRows.reduce((sum, r) => sum + r.amountCents, 0)

  return (
    <div className="space-y-6">
      <h3 className="font-medium">Confirm Import</h3>

      <div className="space-y-1">
        <p>{previewRows.length} rows to import</p>
        <p className="font-medium">Total: {formatCents(totalCents, currency)}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Category Breakdown</h4>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(([name, { count, totalCents: catTotal }]) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell className="text-right">{count}</TableCell>
                  <TableCell className="text-right">{formatCents(catTotal, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onConfirm} disabled={loading}>
          {loading ? 'Importing...' : 'Confirm Import'}
        </Button>
      </div>
    </div>
  )
}
