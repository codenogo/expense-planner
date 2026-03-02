import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { CREATE_INVITE_CODE_MUTATION } from '@/graphql/household'
import type { InviteCode } from '@/types/household'
import { useHousehold } from '@/providers/household-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function InvitePage() {
  const { currentHouseholdId } = useHousehold()
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null)
  const [copied, setCopied] = useState(false)

  const [createInviteCode, { loading, error }] = useMutation<
    { createInviteCode: InviteCode },
    { householdID: string }
  >(CREATE_INVITE_CODE_MUTATION, {
    onCompleted(data) {
      setInviteCode(data.createInviteCode)
    },
  })

  function handleGenerate() {
    if (!currentHouseholdId) return
    createInviteCode({ variables: { householdID: currentHouseholdId } })
  }

  async function handleCopy() {
    if (!inviteCode) return
    await navigator.clipboard.writeText(inviteCode.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Invite Members</h1>
      <p className="text-muted-foreground mt-2">Generate an invite code to share with others</p>

      <Card className="mt-6 max-w-md">
        <CardHeader>
          <CardTitle>Generate Invite Code</CardTitle>
          <CardDescription>
            Create a code that others can use to join your household
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive mb-4">{error.message}</p>
          )}
          {!currentHouseholdId && (
            <p className="text-sm text-destructive mb-4">No household selected</p>
          )}
          <Button onClick={handleGenerate} disabled={loading || !currentHouseholdId}>
            {loading ? 'Generating...' : 'Generate Code'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={!!inviteCode} onOpenChange={(open) => !open && setInviteCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Code Generated</DialogTitle>
            <DialogDescription>
              Share this code with someone to invite them to your household. It expires at{' '}
              {inviteCode && new Date(inviteCode.expiresAt).toLocaleString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border p-4">
            <code className="flex-1 text-lg font-mono">{inviteCode?.code}</code>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
