import { useMutation, useQuery } from '@apollo/client/react'
import {
  HOUSEHOLD_MEMBERS_QUERY,
  REMOVE_MEMBER_MUTATION,
  UPDATE_MEMBER_ROLE_MUTATION,
} from '@/graphql/household'
import type { HouseholdMember, HouseholdMemberRole } from '@/types/household'
import { useHousehold } from '@/providers/household-provider'
import { useAuth } from '@/providers/auth-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="text-sm text-destructive mt-2">{error.message}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Members</h1>
      <p className="text-muted-foreground mt-2">Manage your household members</p>

      {!currentHouseholdId && (
        <p className="text-sm text-destructive mt-4">No household selected</p>
      )}

      {members.length === 0 && currentHouseholdId && (
        <p className="text-muted-foreground mt-4">No members found</p>
      )}

      {members.length > 0 && (
        <div className="mt-6 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                {isOwner && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.user.name}</TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>
                    {isOwner && member.user.id !== currentUser?.id ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          handleRoleChange(member.user.id, value as HouseholdMemberRole)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    )}
                  </TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      {member.user.id !== currentUser?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={removing}>
                              Remove
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
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
