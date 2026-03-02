import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { JOIN_HOUSEHOLD_MUTATION } from '@/graphql/household'
import type { HouseholdMember } from '@/types/household'
import { useHousehold } from '@/providers/household-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function JoinHouseholdPage() {
  const navigate = useNavigate()
  const { setCurrentHouseholdId, setCurrentHousehold } = useHousehold()
  const [code, setCode] = useState('')

  const [joinHousehold, { loading, error }] = useMutation<
    { joinHousehold: HouseholdMember },
    { code: string }
  >(JOIN_HOUSEHOLD_MUTATION, {
    onCompleted(data) {
      setCurrentHouseholdId(data.joinHousehold.household.id)
      setCurrentHousehold(data.joinHousehold.household)
      navigate('/')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    joinHousehold({ variables: { code } })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Household</CardTitle>
          <CardDescription>Enter an invite code to join an existing household</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive">{error.message}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="code">Invite Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter invite code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Joining...' : 'Join Household'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
