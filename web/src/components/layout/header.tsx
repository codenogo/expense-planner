import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="md:hidden">
        <span className="text-lg font-semibold">Expense Planner</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
