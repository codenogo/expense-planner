import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { ProtectedRoute } from '@/components/protected-route'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { DashboardPage } from '@/pages/dashboard'
import { TransactionsPage } from '@/pages/transactions/index'
import { AddExpensePage } from '@/pages/transactions/add-expense'
import { AddIncomePage } from '@/pages/transactions/add-income'
import { ImportPage } from '@/pages/import/index'
import { ReportsPage } from '@/pages/reports/index'
import { SpendingReportPage } from '@/pages/reports/spending'
import { TrendReportPage } from '@/pages/reports/trend'
import { BudgetsPage } from '@/pages/budgets/index'
import { CreateBudgetPage } from '@/pages/budgets/create'
import { Toaster } from '@/components/ui/sonner'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">Coming soon...</p>
    </div>
  )
}

export default function App() {
  return (
    <>
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/add-expense" element={<AddExpensePage />} />
          <Route path="transactions/add-income" element={<AddIncomePage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/spending" element={<SpendingReportPage />} />
          <Route path="reports/trend" element={<TrendReportPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="budgets/create" element={<CreateBudgetPage />} />
          <Route path="household" element={<PlaceholderPage title="Household" />} />
        </Route>
      </Route>
    </Routes>
    <Toaster />
    </>
  )
}
