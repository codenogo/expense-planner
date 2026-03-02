import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { JOIN_HOUSEHOLD_MUTATION } from '@/graphql/household'
import type { HouseholdMember } from '@/types/household'
import { useHousehold } from '@/providers/household-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, KeyRound } from 'lucide-react'

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
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-400/10">
            <UserPlus className="h-6 w-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Join Household</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter an invite code to join an existing household
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{error.message}</div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-medium text-muted-foreground">Invite Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter invite code"
                  className="pl-10"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Joining...' : 'Join Household'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
