import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { CREATE_HOUSEHOLD_MUTATION } from '@/graphql/household'
import type { Household, CreateHouseholdInput } from '@/types/household'
import { useHousehold } from '@/providers/household-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Household</CardTitle>
          <CardDescription>Set up a new household to track expenses together</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive">{error.message}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Household Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Smith Family"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Household'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
