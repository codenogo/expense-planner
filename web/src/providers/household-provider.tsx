import { createContext, useContext, useState } from 'react'
import type { Household } from '@/types/household'

const HOUSEHOLD_ID_KEY = 'expense_planner_household_id'

interface HouseholdContextType {
  currentHouseholdId: string | null
  setCurrentHouseholdId: (id: string | null) => void
  currentHousehold: Household | null
  setCurrentHousehold: (household: Household | null) => void
}

const HouseholdContext = createContext<HouseholdContextType | null>(null)

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const [currentHouseholdId, setCurrentHouseholdIdState] = useState<string | null>(
    () => localStorage.getItem(HOUSEHOLD_ID_KEY)
  )
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null)

  function setCurrentHouseholdId(id: string | null) {
    setCurrentHouseholdIdState(id)
    if (id) {
      localStorage.setItem(HOUSEHOLD_ID_KEY, id)
    } else {
      localStorage.removeItem(HOUSEHOLD_ID_KEY)
    }
  }

  return (
    <HouseholdContext.Provider value={{ currentHouseholdId, setCurrentHouseholdId, currentHousehold, setCurrentHousehold }}>
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHousehold() {
  const context = useContext(HouseholdContext)
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider')
  }
  return context
}
