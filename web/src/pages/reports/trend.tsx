import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MONTHLY_TREND_QUERY } from '@/graphql/reports'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'
import type { MonthSummary } from '@/types/reports'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const monthOptions = [3, 6, 12]

export function TrendReportPage() {
  const { currentHouseholdId, currentHousehold } = useHousehold()
  const currency = currentHousehold?.baseCurrency ?? 'KES'
  const [months, setMonths] = useState(6)

  const { data, loading, error } = useQuery<{ monthlyTrend: MonthSummary[] }>(
    MONTHLY_TREND_QUERY,
    {
      variables: { householdID: currentHouseholdId, months },
      skip: !currentHouseholdId,
    }
  )

  const trends = data?.monthlyTrend ?? []

  // Convert cents to major units for chart readability
  const chartData = trends.map((m) => ({
    month: m.month,
    income: m.incomeCents / 100,
    expenses: m.expenseCents / 100,
    net: m.netCents / 100,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reports">← Reports</Link>
        </Button>
        <h1 className="text-2xl font-bold">Monthly Trend</h1>
      </div>

      <div className="flex gap-2">
        {monthOptions.map((n) => (
          <Button
            key={n}
            variant={months === n ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMonths(n)}
          >
            {n} Months
          </Button>
        ))}
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {!loading && !error && trends.length === 0 && (
        <p className="text-muted-foreground">No data available for this period.</p>
      )}

      {trends.length > 0 && (
        <>
          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number | undefined) => value != null ? formatCents(value * 100, currency) : ''}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#22c55e" name="Income" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2} />
                  <Line type="monotone" dataKey="net" stroke="#3b82f6" name="Net" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Income</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trends.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell className="font-medium">{m.month}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCents(m.incomeCents, currency)}</TableCell>
                    <TableCell className="text-right text-red-600">{formatCents(m.expenseCents, currency)}</TableCell>
                    <TableCell className={`text-right font-medium ${m.netCents >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCents(m.netCents, currency)}
                    </TableCell>
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
