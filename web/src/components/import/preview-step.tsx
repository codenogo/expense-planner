import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { PREVIEW_CSV_MUTATION } from '@/graphql/import'
import { CATEGORIES_QUERY } from '@/graphql/categories'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'
import type { ColumnMapping, ImportPreviewRow } from '@/types/import'
import type { Category } from '@/types/category'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PreviewStepProps {
  csvContent: string
  mapping: ColumnMapping
  previewRows: ImportPreviewRow[]
  onPreviewLoaded: (rows: ImportPreviewRow[]) => void
  onContinue: () => void
  onBack: () => void
}

export function PreviewStep({
  csvContent,
  mapping,
  previewRows,
  onPreviewLoaded,
  onContinue,
  onBack,
}: PreviewStepProps) {
  const { currentHouseholdId, currentHousehold } = useHousehold()
  const currency = currentHousehold?.baseCurrency ?? 'KES'

  const { data: categoriesData } = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY)

  const [preview, { loading, error }] = useMutation<
    { previewCSVImport: ImportPreviewRow[] },
    { csvContent: string; mapping: ColumnMapping; householdID: string }
  >(PREVIEW_CSV_MUTATION)

  // Track local edits to category selections
  const [editedCategories, setEditedCategories] = useState<Record<number, { id: string; name: string }>>({})

  useEffect(() => {
    if (previewRows.length > 0 || !currentHouseholdId) return

    preview({
      variables: {
        csvContent,
        mapping,
        householdID: currentHouseholdId,
      },
    }).then((result) => {
      if (result.data?.previewCSVImport) {
        onPreviewLoaded(result.data.previewCSVImport)
      }
    })
  }, []) // Run once on mount

  function handleCategoryChange(index: number, categoryId: string) {
    const cat = categoriesData?.categories.find((c) => c.id === categoryId)
    if (cat) {
      setEditedCategories((prev) => ({ ...prev, [index]: { id: cat.id, name: cat.name } }))
    }
  }

  const rows = previewRows
  const totalCents = rows.reduce((sum, r) => sum + r.amountCents, 0)

  if (loading) {
    return <p className="text-muted-foreground py-4">Parsing CSV...</p>
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button variant="outline" onClick={onBack}>Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Preview ({rows.length} rows)</h3>
        <p className="text-sm text-muted-foreground">
          Total: {formatCents(totalCents, currency)}
        </p>
      </div>

      <div className="rounded-md border overflow-x-auto max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{row.description}</TableCell>
                <TableCell className={`text-right ${row.amountCents < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCents(row.amountCents, currency)}
                </TableCell>
                <TableCell>
                  <Select
                    value={editedCategories[i]?.id ?? row.suggestedCategoryID ?? ''}
                    onValueChange={(val) => handleCategoryChange(i, val)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={row.suggestedCategoryName || 'Select'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesData?.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onContinue} disabled={rows.length === 0}>
          Continue to Confirm
        </Button>
      </div>
    </div>
  )
}
