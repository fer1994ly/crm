import { formatCrc } from './money'
import { formatDate } from './dates'
import { newId } from './ids'

describe('shared formatting', () => {
  it('formats colones without decimals', () => {
    expect(formatCrc(1250000)).toContain('₡')
    expect(formatCrc(1250000).replace(/\D/g, '')).toBe('1250000')
  })

  it('formats an ISO date in Spanish for Costa Rica', () => {
    expect(formatDate('2026-10-03T15:00:00.000Z')).toMatch(/3/)
    expect(formatDate('2026-10-03T15:00:00.000Z').toLowerCase()).toContain('oct')
  })

  it('generates unique prefixed ids', () => {
    const a = newId('cli')
    const b = newId('cli')
    expect(a).toMatch(/^cli-/)
    expect(a).not.toBe(b)
  })
})
