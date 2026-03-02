import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { SPENDING_BY_CATEGORY_QUERY } from '@/graphql/reports'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'
import type { CategorySpend } from '@/types/reports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function getMonthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export function SpendingReportPage() {
  const { currentHouseholdId, currentHousehold } = useHousehold()
  const currency = currentHousehold?.baseCurrency ?? 'KES'

  const [startDate, setStartDate] = useState(getMonthStart)
  const [endDate, setEndDate] = useState(getToday)

  const { data, loading, error } = useQuery<{ spendingByCategory: CategorySpend[] }>(
    SPENDING_BY_CATEGORY_QUERY,
    {
      variables: {
        householdID: currentHouseholdId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      },
      skip: !currentHouseholdId,
    }
  )

  const categories = data?.spendingByCategory ?? []

  // Prepare chart data — convert cents to major currency units for readability
  const chartData = categories.map((cat) => ({
    name: cat.name,
    amount: cat.totalCents / 100,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reports">← Reports</Link>
        </Button>
        <h1 className="text-2xl font-bold">Spending by Category</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {!loading && !error && categories.length === 0 && (
        <p className="text-muted-foreground">No expenses found in this date range.</p>
      )}

      {categories.length > 0 && (
        <>
          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={Math.max(200, categories.length * 40)}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(value: number | undefined) => value != null ? formatCents(value * 100, currency) : ''} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.categoryID}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-right">{formatCents(cat.totalCents, currency)}</TableCell>
                    <TableCell className="text-right">{cat.percentage.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
