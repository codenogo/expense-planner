import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { ProtectedRoute } from '@/components/protected-route'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { DashboardPage } from '@/pages/dashboard'

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
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<PlaceholderPage title="Transactions" />} />
          <Route path="import" element={<PlaceholderPage title="Import" />} />
          <Route path="reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="budgets" element={<PlaceholderPage title="Budgets" />} />
          <Route path="household" element={<PlaceholderPage title="Household" />} />
        </Route>
      </Route>
    </Routes>
  )
}
