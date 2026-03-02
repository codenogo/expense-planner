import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/providers/theme-provider'
import { ApolloProvider } from '@/providers/apollo-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { HouseholdProvider } from '@/providers/household-provider'
import App from './app'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system">
        <ApolloProvider>
          <AuthProvider>
            <HouseholdProvider>
              <App />
            </HouseholdProvider>
          </AuthProvider>
        </ApolloProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
