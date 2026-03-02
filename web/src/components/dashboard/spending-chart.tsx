import { useQuery } from '@apollo/client/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { SPENDING_BY_CATEGORY_QUERY } from '@/graphql/reports'
import type { CategorySpend } from '@/types/reports'
import { useHousehold } from '@/providers/household-provider'
import { formatCents } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

export function SpendingChart() {
  const { currentHouseholdId, currentHousehold } = useHousehold()

  // Get first and last day of current month
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data, loading } = useQuery<{ spendingByCategory: CategorySpend[] }>(
    SPENDING_BY_CATEGORY_QUERY,
    {
      variables: { householdID: currentHouseholdId, startDate, endDate },
      skip: !currentHouseholdId,
    }
  )

  const categories = data?.spendingByCategory ?? []
  const currency = currentHousehold?.baseCurrency ?? 'KES'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-muted-foreground">Loading...</p>}

        {!loading && categories.length === 0 && (
          <p className="text-muted-foreground">No expenses this month</p>
        )}

        {!loading && categories.length > 0 && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="totalCents"
                  nameKey="name"
                >
                  {categories.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value != null ? formatCents(value, currency) : ''
                  }
                />
                <Legend
                  formatter={(value: string) => {
                    const item = categories.find((c) => c.name === value)
                    if (!item) return value
                    return `${value} (${item.percentage.toFixed(1)}%)`
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
