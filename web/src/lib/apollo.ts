import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  Observable,
} from '@apollo/client'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth'
import { REFRESH_TOKEN_MUTATION } from '@/graphql/auth'
import type { AuthPayload } from '@/types/auth'

const httpLink = createHttpLink({
  uri: '/query',
})

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken()
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

const errorLink = onError(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error)) return

  const unauthError = error.errors.find(
    (err) =>
      (err.extensions?.['code'] === 'UNAUTHENTICATED') ||
      err.message.toLowerCase().includes('unauthorized') ||
      err.message.toLowerCase().includes('unauthenticated') ||
      err.message.toLowerCase().includes('authentication required')
  )

  if (!unauthError) return

  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearTokens()
    window.location.href = '/login'
    return
  }

  return new Observable((observer) => {
    client
      .mutate<{ refreshToken: AuthPayload }>({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: { token: refreshToken },
      })
      .then(({ data }) => {
        if (data?.refreshToken) {
          setTokens(data.refreshToken.accessToken, data.refreshToken.refreshToken)

          // Retry the original request with new token
          const oldHeaders = operation.getContext().headers as Record<string, string>
          operation.setContext({
            headers: {
              ...oldHeaders,
              authorization: `Bearer ${data.refreshToken.accessToken}`,
            },
          })

          forward(operation).subscribe(observer)
        } else {
          clearTokens()
          window.location.href = '/login'
          observer.error(unauthError)
        }
      })
      .catch(() => {
        clearTokens()
        window.location.href = '/login'
        observer.error(unauthError)
      })
  })
})

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})
