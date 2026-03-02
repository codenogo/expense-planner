import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { CREATE_INVITE_CODE_MUTATION } from '@/graphql/household'
import type { InviteCode } from '@/types/household'
import { useHousehold } from '@/providers/household-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail, Copy, Check } from 'lucide-react'

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
          <Mail className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invite Members</h1>
          <p className="text-xs text-muted-foreground">Generate an invite code to share with others</p>
        </div>
      </div>

      <div className="max-w-md rounded-xl border bg-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Generate Invite Code</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a code that others can use to join your household
          </p>
        </div>
        {error && (
          <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{error.message}</div>
        )}
        {!currentHouseholdId && (
          <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">No household selected</div>
        )}
        <Button onClick={handleGenerate} disabled={loading || !currentHouseholdId}>
          {loading ? 'Generating...' : 'Generate Code'}
        </Button>
      </div>

      <Dialog open={!!inviteCode} onOpenChange={(open) => !open && setInviteCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Code Generated</DialogTitle>
            <DialogDescription>
              Share this code with someone to invite them to your household. It expires at{' '}
              {inviteCode && new Date(inviteCode.expiresAt).toLocaleString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-xl border bg-muted/30 p-4">
            <code className="flex-1 text-lg font-mono tracking-wider">{inviteCode?.code}</code>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
              {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
