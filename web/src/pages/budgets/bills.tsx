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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/budgets"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Budgets
          </Link>
          <h1 className="text-2xl font-bold">Recurring Bills</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Add Bill'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Recurring Bill</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bill-name">Name</Label>
                  <Input
                    id="bill-name"
                    placeholder="e.g. Internet"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bill-amount">Amount</Label>
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
                  <Label htmlFor="bill-due-day">Due Day (1–31)</Label>
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
                  <Label htmlFor="bill-frequency">Frequency</Label>
                  <Select
                    value={form.frequency}
                    onValueChange={(v) => handleChange('frequency', v)}
                  >
                    <SelectTrigger id="bill-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {categories.length > 0 && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bill-category">Category (optional)</Label>
                    <Select
                      value={form.categoryID}
                      onValueChange={(v) => handleChange('categoryID', v)}
                    >
                      <SelectTrigger id="bill-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {createError && (
                <p className="text-sm text-destructive">{createError.message}</p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Saving...' : 'Save Bill'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!currentHouseholdId && (
        <p className="text-muted-foreground">Select a household to view recurring bills.</p>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {currentHouseholdId && !loading && !error && (
        bills.length === 0 ? (
          <p className="text-muted-foreground">No recurring bills yet.</p>
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
