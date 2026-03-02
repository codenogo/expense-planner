import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const reports = [
  { to: '/reports/spending', title: 'Spending by Category', description: 'See how your spending breaks down by category over a date range.' },
  { to: '/reports/trend', title: 'Monthly Trend', description: 'Track income, expenses, and net savings over time.' },
]

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Link key={report.to} to={report.to}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
