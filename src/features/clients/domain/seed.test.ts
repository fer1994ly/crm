import { STAGES } from '../../pipeline/domain/stage'
import { createSeedClients } from './seed'

describe('seed clients', () => {
  const clients = createSeedClients()

  it('provides 12 unique institutional clients', () => {
    expect(clients).toHaveLength(12)
    expect(new Set(clients.map((c) => c.id)).size).toBe(12)
  })

  it('covers every stage with at least 2 closed orders', () => {
    for (const stage of STAGES) {
      expect(clients.some((c) => c.stage === stage)).toBe(true)
    }
    expect(clients.filter((c) => c.stage === 'pedido-cerrado').length).toBeGreaterThanOrEqual(2)
  })

  it('uses Costa Rican phone format and a valid quantity', () => {
    for (const c of clients) {
      expect(c.phone).toMatch(/^\+506 \d{4}-\d{4}$/)
      expect(Number.isInteger(c.quantity) && c.quantity > 0).toBe(true)
      expect(c.history.length).toBeGreaterThan(0)
    }
  })

  it('contains no placeholder text', () => {
    expect(JSON.stringify(clients).toLowerCase()).not.toContain('lorem')
  })

  it('returns fresh copies on every call', () => {
    expect(createSeedClients()).not.toBe(clients)
    expect(createSeedClients()).toEqual(clients)
  })
})
