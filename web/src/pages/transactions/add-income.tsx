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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

export function AddIncomePage() {
  const navigate = useNavigate()
  const { currentHouseholdId } = useHousehold()

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)

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
    if (!currentHouseholdId) return

    const cents = Math.round(parseFloat(amount) * 100)
    if (isNaN(cents) || cents <= 0) return

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
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Add Income</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What was this income for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
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

            {error && <p className="text-sm text-destructive">{error.message}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !categoryId}>
                {loading ? 'Adding...' : 'Add Income'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/transactions')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
