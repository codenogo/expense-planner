import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client/react'
import { ADD_INCOME_MUTATION } from '@/graphql/transactions'
import { CATEGORIES_QUERY } from '@/graphql/categories'
import type { Category } from '@/types/category'
import { useHousehold } from '@/providers/household-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ArrowUpRight, DollarSign, FileText, Tag, CalendarIcon, Search, Check } from 'lucide-react'

export function AddIncomePage() {
  const navigate = useNavigate()
  const { currentHouseholdId } = useHousehold()

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')

  const { data: categoriesData } = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY)

  const [addIncome, { loading, error }] = useMutation<
    { addIncome: { id: string } },
    { input: { amount: number; householdID: string; categoryID: string; description: string; date: string } }
  >(ADD_INCOME_MUTATION, {
    onCompleted() {
      navigate('/transactions')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!currentHouseholdId) return

    const cents = Math.round(parseFloat(amount) * 100)
    if (isNaN(cents) || cents <= 0) {
      setFormError('Amount must be greater than zero')
      return
    }

    addIncome({
      variables: {
        input: {
          amount: cents,
          householdID: currentHouseholdId,
          categoryID: categoryId,
          description,
          date: date.toISOString(),
        },
      },
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
          <ArrowUpRight className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Add Income</h1>
          <p className="text-xs text-muted-foreground">Record a new income</p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-xl border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
              Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
              Description
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="description"
                placeholder="What was this income for?"
                className="pl-10"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              <Tag className="mr-1.5 inline h-3.5 w-3.5" />
              Category
            </Label>
            <Popover open={categoryOpen} onOpenChange={(open) => { setCategoryOpen(open); if (!open) setCategorySearch('') }}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {categoryId ? categoriesData?.categories.find((c) => c.id === categoryId)?.name : <span className="text-muted-foreground">Select category</span>}
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
                  {categoriesData?.categories
                    .filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                        onClick={() => { setCategoryId(cat.id); setCategoryOpen(false); setCategorySearch('') }}
                      >
                        <Check className={`h-4 w-4 ${categoryId === cat.id ? 'text-emerald-400' : 'text-transparent'}`} />
                        {cat.name}
                      </button>
                    ))}
                  {categoriesData?.categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                    <p className="px-2 py-4 text-center text-sm text-muted-foreground">No categories found</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              <CalendarIcon className="mr-1.5 inline h-3.5 w-3.5" />
              Date
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {date.toLocaleDateString()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) {
                      setDate(d)
                      setCalendarOpen(false)
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {formError && (
            <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
              {formError}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
              {error.message}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading || !categoryId} className="flex-1">
              {loading ? 'Adding...' : 'Add Income'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/transactions')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
