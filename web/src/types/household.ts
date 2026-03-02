export interface Household {
  id: string
  name: string
  baseCurrency: string
  createdAt: string
}

export interface HouseholdMember {
  id: string
  role: HouseholdMemberRole
  joinedAt: string
  household: Household
  user: {
    id: string
    name: string
    email: string
  }
}

export type HouseholdMemberRole = 'owner' | 'member'

export interface InviteCode {
  id: string
  code: string
  expiresAt: string
  used: boolean
  createdAt: string
}

export interface CreateHouseholdInput {
  name: string
  baseCurrency?: string
}
