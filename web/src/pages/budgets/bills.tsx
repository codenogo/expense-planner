import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { RECURRING_BILLS_QUERY, CREATE_RECURRING_BILL_MUTATION } from '@/graphql/budgets'
import { CATEGORIES_QUERY } from '@/graphql/categories'
import { useHousehold } from '@/providers/household-provider'
import type { RecurringBill } from '@/types/budget'
import type { Category } from '@/types/category'
import { BillCard } from '@/components/budgets/bill-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ArrowLeft, Receipt, Plus, X, Search, Check } from 'lucide-react'

interface BillFormState {
  name: string
  amountCents: string
  dueDay: string
  frequency: string
  categoryID: string
}

const defaultForm: BillFormState = {
  name: '',
  amountCents: '',
  dueDay: '',
  frequency: 'monthly',
  categoryID: '',
}

export function BillsPage() {
  const { currentHouseholdId, currentHousehold } = useHousehold()
  const currency = currentHousehold?.baseCurrency ?? 'KES'
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<BillFormState>(defaultForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')

  const { data, loading, error } = useQuery<{ recurringBills: RecurringBill[] }>(
    RECURRING_BILLS_QUERY,
    { skip: !currentHouseholdId }
  )

  const { data: catData } = useQuery<{ categories: Category[] }>(
    CATEGORIES_QUERY,
    { skip: !currentHouseholdId }
  )

  const [createBill, { loading: creating, error: createError }] = useMutation(
    CREATE_RECURRING_BILL_MUTATION,
    { refetchQueries: [{ query: RECURRING_BILLS_QUERY }] }
  )

  const bills = data?.recurringBills ?? []
  const categories = catData?.categories ?? []

  function handleChange(field: keyof BillFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentHouseholdId) return

    const amountCents = Math.round(parseFloat(form.amountCents) * 100)
    const dueDay = parseInt(form.dueDay, 10)

    if (isNaN(amountCents) || isNaN(dueDay)) return

    if (amountCents <= 0) {
      setFormError('Amount must be greater than zero')
      return
    }
    if (dueDay < 1 || dueDay > 31) {
      setFormError('Due day must be between 1 and 31')
      return
    }
    setFormError(null)

    const input: Record<string, unknown> = {
      name: form.name.trim(),
      amountCents,
      dueDay,
      frequency: form.frequency,
      householdID: currentHouseholdId,
    }
    if (form.categoryID) {
      input.categoryID = form.categoryID
    }

    await createBill({ variables: { input } })
    setForm(defaultForm)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to="/budgets"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/10">
            <Receipt className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Recurring Bills</h1>
            <p className="text-xs text-muted-foreground">Manage your regular payments</p>
          </div>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-1.5">
          {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Add Bill</>}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">New Recurring Bill</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bill-name" className="text-xs font-medium text-muted-foreground">Name</Label>
                <Input
                  id="bill-name"
                  placeholder="e.g. Internet"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bill-amount" className="text-xs font-medium text-muted-foreground">Amount</Label>
                <Input
                  id="bill-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amountCents}
                  onChange={(e) => handleChange('amountCents', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bill-due-day" className="text-xs font-medium text-muted-foreground">Due Day (1–31)</Label>
                <Input
                  id="bill-due-day"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1"
                  value={form.dueDay}
                  onChange={(e) => handleChange('dueDay', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Frequency</Label>
                <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
                  {[
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'annual', label: 'Annual' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        form.frequency === opt.value
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => handleChange('frequency', opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {categories.length > 0 && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">Category (optional)</Label>
                  <Popover open={categoryOpen} onOpenChange={(open) => { setCategoryOpen(open); if (!open) setCategorySearch('') }}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {form.categoryID ? categories.find((c) => c.id === form.categoryID)?.name : <span className="text-muted-foreground">Select category</span>}
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
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
                          onClick={() => { handleChange('categoryID', ''); setCategoryOpen(false); setCategorySearch('') }}
                        >
                          <Check className={`h-4 w-4 ${!form.categoryID ? 'text-emerald-400' : 'text-transparent'}`} />
                          None
                        </button>
                        {categories
                          .filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                          .map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                              onClick={() => { handleChange('categoryID', cat.id); setCategoryOpen(false); setCategorySearch('') }}
                            >
                              <Check className={`h-4 w-4 ${form.categoryID === cat.id ? 'text-emerald-400' : 'text-transparent'}`} />
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
              )}
            </div>

            {formError && (
              <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{formError}</div>
            )}
            {createError && (
              <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{createError.message}</div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={creating}>
                {creating ? 'Saving...' : 'Save Bill'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {!currentHouseholdId && (
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Select a household to view recurring bills.</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-6 w-20 rounded bg-muted animate-pulse" />
              <div className="h-3 w-full rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{error.message}</div>
      )}

      {currentHouseholdId && !loading && !error && (
        bills.length === 0 ? (
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">No recurring bills yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bills.map((bill) => (
              <BillCard key={bill.id} bill={bill} currency={currency} />
            ))}
          </div>
        )
      )}
    </div>
  )
}
