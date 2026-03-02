import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { LOGIN_MUTATION, REGISTER_MUTATION } from '@/graphql/auth'
import type { User, AuthPayload, LoginInput, RegisterInput } from '@/types/auth'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/auth'
import { REFRESH_TOKEN_MUTATION } from '@/graphql/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [loginMutation] = useMutation<{ login: AuthPayload }, { input: LoginInput }>(LOGIN_MUTATION)
  const [registerMutation] = useMutation<{ register: AuthPayload }, { input: RegisterInput }>(REGISTER_MUTATION)
  const [refreshMutation] = useMutation<{ refreshToken: AuthPayload }, { token: string }>(REFRESH_TOKEN_MUTATION)

  // Check for existing token on mount
  useEffect(() => {
    async function initAuth() {
      const token = getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      const parts = token.split('.')
      if (parts.length !== 3) {
        clearTokens()
        setLoading(false)
        return
      }

      try {
        const payload = JSON.parse(atob(parts[1]))

        // Check if access token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Try to refresh
          const refreshToken = getRefreshToken()
          if (!refreshToken) {
            clearTokens()
            setLoading(false)
            return
          }

          try {
            const { data } = await refreshMutation({ variables: { token: refreshToken } })
            if (data?.refreshToken) {
              setTokens(data.refreshToken.accessToken, data.refreshToken.refreshToken)
              setUser(data.refreshToken.user)
            } else {
              clearTokens()
            }
          } catch {
            clearTokens()
          }
          setLoading(false)
          return
        }

        setUser({ id: payload.sub, name: payload.name || '', email: payload.email || '', createdAt: '', updatedAt: '' })
      } catch {
        clearTokens()
      }
      setLoading(false)
    }

    initAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (input: LoginInput) => {
    const { data } = await loginMutation({ variables: { input } })
    if (data) {
      setTokens(data.login.accessToken, data.login.refreshToken)
      setUser(data.login.user)
    }
  }, [loginMutation])

  const register = useCallback(async (input: RegisterInput) => {
    const { data } = await registerMutation({ variables: { input } })
    if (data) {
      setTokens(data.register.accessToken, data.register.refreshToken)
      setUser(data.register.user)
    }
  }, [registerMutation])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
