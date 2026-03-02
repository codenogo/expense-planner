import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { CREATE_HOUSEHOLD_MUTATION } from '@/graphql/household'
import type { Household, CreateHouseholdInput } from '@/types/household'
import { useHousehold } from '@/providers/household-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home, Users } from 'lucide-react'

export function CreateHouseholdPage() {
  const navigate = useNavigate()
  const { setCurrentHouseholdId, setCurrentHousehold } = useHousehold()
  const [name, setName] = useState('')

  const [createHousehold, { loading, error }] = useMutation<
    { createHousehold: Household },
    { input: CreateHouseholdInput }
  >(CREATE_HOUSEHOLD_MUTATION, {
    onCompleted(data) {
      setCurrentHouseholdId(data.createHousehold.id)
      setCurrentHousehold(data.createHousehold)
      navigate('/')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createHousehold({ variables: { input: { name } } })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10">
            <Home className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Household</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up a new household to track expenses together
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{error.message}</div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Household Name</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Smith Family"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Household'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
