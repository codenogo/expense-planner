export function formatCents(cents: number, currency = 'KES'): string {
  const abs = Math.abs(cents)
  const major = Math.floor(abs / 100)
  const minor = abs % 100
  const sign = cents < 0 ? '-' : ''

  const formatted = major.toLocaleString('en-US')
  const decimal = minor.toString().padStart(2, '0')

  const symbolMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  }

  const symbol = symbolMap[currency]
  if (symbol) {
    return `${sign}${symbol}${formatted}.${decimal}`
  }

  return `${sign}${currency} ${formatted}.${decimal}`
}
