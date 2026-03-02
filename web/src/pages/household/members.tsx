import { useMutation, useQuery } from '@apollo/client/react'
import {
  HOUSEHOLD_MEMBERS_QUERY,
  REMOVE_MEMBER_MUTATION,
  UPDATE_MEMBER_ROLE_MUTATION,
} from '@/graphql/household'
import type { HouseholdMember, HouseholdMemberRole } from '@/types/household'
import { useHousehold } from '@/providers/household-provider'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Users, UserMinus, Home, UserPlus, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function MembersPage() {
  const { currentHouseholdId } = useHousehold()
  const { user: currentUser } = useAuth()

  const { data, loading, error, refetch } = useQuery<{ householdMembers: HouseholdMember[] }>(
    HOUSEHOLD_MEMBERS_QUERY
  )

  const [removeMember, { loading: removing }] = useMutation<
    { removeMember: boolean },
    { householdID: string; userID: string }
  >(REMOVE_MEMBER_MUTATION, {
    onCompleted() {
      refetch()
    },
  })

  const [updateRole] = useMutation<
    { updateMemberRole: HouseholdMember },
    { householdID: string; userID: string; role: HouseholdMemberRole }
  >(UPDATE_MEMBER_ROLE_MUTATION, {
    onCompleted() {
      refetch()
    },
  })

  // Filter members for current household
  const members = data?.householdMembers?.filter(
    (m) => m.household.id === currentHouseholdId
  ) ?? []

  // Check if current user is an owner
  const currentMember = members.find((m) => m.user.id === currentUser?.id)
  const isOwner = currentMember?.role === 'owner'

  function handleRoleChange(userId: string, role: HouseholdMemberRole) {
    if (!currentHouseholdId) return
    updateRole({ variables: { householdID: currentHouseholdId, userID: userId, role } })
  }

  function handleRemove(userId: string) {
    if (!currentHouseholdId) return
    removeMember({ variables: { householdID: currentHouseholdId, userID: userId } })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10">
            <Users className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Household</h1>
            <p className="text-xs text-muted-foreground">Manage your household members</p>
          </div>
        </div>
        {isOwner && (
          <Button variant="outline" size="sm" asChild>
            <Link to="/household/invite">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </Link>
          </Button>
        )}
      </div>

      {!currentHouseholdId && (
        <div className="rounded-xl border bg-card p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10">
              <Home className="h-7 w-7 text-emerald-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">No household yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create a new household to start tracking expenses, or join an existing one with an invite code.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link to="/household/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Household
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/household/join">
                <UserPlus className="mr-2 h-4 w-4" />
                Join with Invite Code
              </Link>
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-3 w-48 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
          {error.message}
        </div>
      )}

      {!loading && !error && members.length === 0 && currentHouseholdId && (
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">No members found</p>
        </div>
      )}

      {members.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase">
                  {member.user.name?.charAt(0) ?? '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                </div>

                {/* Role */}
                <div className="shrink-0">
                  {isOwner && member.user.id !== currentUser?.id ? (
                    <div className="flex gap-0.5 rounded-lg bg-muted/50 p-0.5">
                      {(['owner', 'member'] as const).map((role) => (
                        <button
                          key={role}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            member.role === role
                              ? role === 'owner'
                                ? 'bg-emerald-400/10 text-emerald-400 shadow-sm'
                                : 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => handleRoleChange(member.user.id, role)}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      member.role === 'owner'
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {member.role}
                    </span>
                  )}
                </div>

                {/* Remove action */}
                {isOwner && member.user.id !== currentUser?.id && (
                  <div className="shrink-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10" disabled={removing}>
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {member.user.name} from the household. They will need a new invite code to rejoin.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemove(member.user.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
