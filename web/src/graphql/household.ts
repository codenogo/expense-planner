import { gql } from '@apollo/client'

export const CREATE_HOUSEHOLD_MUTATION = gql`
  mutation CreateHousehold($input: CreateHouseholdInput!) {
    createHousehold(input: $input) {
      id
      name
      baseCurrency
      createdAt
    }
  }
`

export const HOUSEHOLDS_QUERY = gql`
  query Households {
    households {
      id
      name
      baseCurrency
      createdAt
      members {
        id
        role
        user {
          id
          name
          email
        }
      }
    }
  }
`

export const CREATE_INVITE_CODE_MUTATION = gql`
  mutation CreateInviteCode($householdID: ID!) {
    createInviteCode(householdID: $householdID) {
      id
      code
      expiresAt
      used
      createdAt
    }
  }
`

export const JOIN_HOUSEHOLD_MUTATION = gql`
  mutation JoinHousehold($code: String!) {
    joinHousehold(code: $code) {
      id
      role
      household {
        id
        name
        baseCurrency
        createdAt
      }
      user {
        id
        name
        email
      }
    }
  }
`

export const HOUSEHOLD_MEMBERS_QUERY = gql`
  query HouseholdMembers {
    householdMembers {
      id
      role
      joinedAt
      household {
        id
        name
      }
      user {
        id
        name
        email
      }
    }
  }
`

export const REMOVE_MEMBER_MUTATION = gql`
  mutation RemoveMember($householdID: ID!, $userID: ID!) {
    removeMember(householdID: $householdID, userID: $userID)
  }
`

export const UPDATE_MEMBER_ROLE_MUTATION = gql`
  mutation UpdateMemberRole($householdID: ID!, $userID: ID!, $role: HouseholdMemberRole!) {
    updateMemberRole(householdID: $householdID, userID: $userID, role: $role) {
      id
      role
      user {
        id
        name
        email
      }
    }
  }
`
