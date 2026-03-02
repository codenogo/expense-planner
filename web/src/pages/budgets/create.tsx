import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client/react'
import { CREATE_BUDGET_MUTATION, BUDGETS_QUERY } from '@/graphql/budgets'
import { CATEGORIES_QUERY } from '@/graphql/categories'
import { useHousehold } from '@/providers/household-provider'
import type { Category } from '@/types/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ArrowLeft, Target, DollarSign, CalendarIcon, ChevronLeft, ChevronRight, Search, Check } from 'lucide-react'

function currentMonthValue(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

export function CreateBudgetPage() {
  const navigate = useNavigate()
  const { currentHouseholdId } = useHousehold()

  const [categoryID, setCategoryID] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [month, setMonth] = useState<string>(currentMonthValue())
  const [rollover, setRollover] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const [monthPickerYear, setMonthPickerYear] = useState(() => new Date().getFullYear())
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')

  const { data: categoriesData } = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY)
  const categories = categoriesData?.categories ?? []

  const [createBudget, { loading }] = useMutation(CREATE_BUDGET_MUTATION, {
    refetchQueries: [{ query: BUDGETS_QUERY }],
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!currentHouseholdId) {
      setFormError('No household selected.')
      return
    }

    if (!categoryID) {
      setFormError('Please select a category.')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid amount.')
      return
    }

    try {
      await createBudget({
        variables: {
          input: {
            month,
            amountCents: Math.round(parsedAmount * 100),
            rollover,
            householdID: currentHouseholdId,
            categoryID,
          },
        },
      })
      navigate('/budgets')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create budget.'
      if (message.toLowerCase().includes('duplicate') || message.toLowerCase().includes('already exists')) {
        setFormError('A budget for this category and month already exists.')
      } else {
        setFormError(message)
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/budgets')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
          <Target className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Create Budget</h1>
          <p className="text-xs text-muted-foreground">Set a spending limit for a category</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">Category</Label>
            <Popover open={categoryOpen} onOpenChange={(open) => { setCategoryOpen(open); if (!open) setCategorySearch('') }}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {categoryID ? categories.find((c) => c.id === categoryID)?.name : <span className="text-muted-foreground">Select a category</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <div className="flex items-center border-b px-3">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    className="flex h-10 w-full bg-transparent py-3 pl-2 text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                  {categories
                    .filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                        onClick={() => { setCategoryID(cat.id); setCategoryOpen(false); setCategorySearch('') }}
                      >
                        <Check className={`h-4 w-4 ${categoryID === cat.id ? 'text-emerald-400' : 'text-transparent'}`} />
                        {cat.name}
                      </button>
                    ))}
                  {categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                    <p className="px-2 py-4 text-center text-sm text-muted-foreground">No categories found</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="month" className="text-xs font-medium text-muted-foreground">Month</Label>
            <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {(() => {
                    const [y, m] = month.split('-')
                    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
                  })()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={() => setMonthPickerYear((y) => y - 1)} className="rounded-md p-1 hover:bg-muted transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold">{monthPickerYear}</span>
                  <button type="button" onClick={() => setMonthPickerYear((y) => y + 1)} className="rounded-md p-1 hover:bg-muted transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {Array.from({ length: 12 }, (_, i) => {
                    const val = `${monthPickerYear}-${(i + 1).toString().padStart(2, '0')}`
                    const isActive = val === month
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-emerald-400/10 text-emerald-400'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        onClick={() => { setMonth(val); setMonthPickerOpen(false) }}
                      >
                        {new Date(monthPickerYear, i).toLocaleDateString(undefined, { month: 'short' })}
                      </button>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-start gap-3">
            <Switch
              id="rollover"
              checked={rollover}
              onCheckedChange={setRollover}
            />
            <div className="space-y-0.5">
              <Label htmlFor="rollover" className="cursor-pointer text-sm">Rollover</Label>
              <p className="text-xs text-muted-foreground">
                When enabled, unspent budget carries forward to next month
              </p>
            </div>
          </div>

          {formError && (
            <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{formError}</div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Budget'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/budgets')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
