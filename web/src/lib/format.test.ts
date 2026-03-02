import { describe, it, expect } from 'vitest'
import { formatCents } from './format'

describe('formatCents', () => {
  it('formats positive cents to currency string', () => {
    expect(formatCents(150000, 'KES')).toBe('KES 1,500.00')
  })

  it('formats zero', () => {
    expect(formatCents(0, 'KES')).toBe('KES 0.00')
  })

  it('formats negative cents', () => {
    expect(formatCents(-50000, 'KES')).toBe('-KES 500.00')
  })

  it('formats with USD currency', () => {
    expect(formatCents(1234, 'USD')).toBe('$12.34')
  })

  it('formats with EUR currency', () => {
    expect(formatCents(9999, 'EUR')).toBe('€99.99')
  })

  it('defaults to KES when no currency provided', () => {
    expect(formatCents(10000)).toBe('KES 100.00')
  })
})
