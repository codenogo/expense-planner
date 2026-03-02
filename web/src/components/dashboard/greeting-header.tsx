import { useAuth } from '@/providers/auth-provider'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export function GreetingHeader() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        {getGreeting()}, {firstName}!
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        All your money matters, all in one place. Managing finances has never been easier.
      </p>
    </div>
  )
}

