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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryID} onValueChange={setCategoryID}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
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

            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>

            <div className="flex items-start gap-3">
              <Switch
                id="rollover"
                checked={rollover}
                onCheckedChange={setRollover}
              />
              <div className="space-y-0.5">
                <Label htmlFor="rollover" className="cursor-pointer">Rollover</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, unspent budget carries forward to next month
                </p>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
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
        </CardContent>
      </Card>
    </div>
  )
}
