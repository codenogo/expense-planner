import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'

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
      <Route element={<AppShell />}>
        <Route index element={<PlaceholderPage title="Dashboard" />} />
        <Route
          path="transactions"
          element={<PlaceholderPage title="Transactions" />}
        />
        <Route path="import" element={<PlaceholderPage title="Import" />} />
        <Route
          path="reports"
          element={<PlaceholderPage title="Reports" />}
        />
        <Route
          path="budgets"
          element={<PlaceholderPage title="Budgets" />}
        />
        <Route
          path="household"
          element={<PlaceholderPage title="Household" />}
        />
      </Route>
    </Routes>
  )
}
