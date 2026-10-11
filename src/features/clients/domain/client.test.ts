import { advanceClient, lastActivityAt, type Client } from './client'

const base: Client = {
  id: 'c1',
  institution: 'Clínica Prueba',
  contactName: 'Ana Mora',
  phone: '+506 2222-3333',
  email: '',
  product: 'Oxímetros',
  quantity: 4,
  estimatedValueCrc: 100000,
  stage: 'nuevo-contacto',
  history: [{ id: 'h1', kind: 'call', text: 'Llamada inicial', at: '2026-10-01T15:00:00.000Z' }],
}

describe('advanceClient', () => {
  it('moves exactly one stage and records a history entry', () => {
    const next = advanceClient(base, '2026-10-05T15:00:00.000Z')
    expect(next.stage).toBe('cotizacion-enviada')
    expect(next.history).toHaveLength(2)
    expect(next.history.at(-1)).toMatchObject({ kind: 'stage', at: '2026-10-05T15:00:00.000Z' })
    expect(next.history.at(-1)?.text).toContain('Cotización enviada')
  })

  it('does not mutate the original client', () => {
    advanceClient(base, '2026-10-05T15:00:00.000Z')
    expect(base.stage).toBe('nuevo-contacto')
    expect(base.history).toHaveLength(1)
  })

  it('refuses to move a closed order', () => {
    const closed = { ...base, stage: 'pedido-cerrado' as const }
    expect(() => advanceClient(closed, '2026-10-05T15:00:00.000Z')).toThrow(/cerrado/i)
  })
})

describe('lastActivityAt', () => {
  it('returns the most recent history date', () => {
    const c = advanceClient(base, '2026-10-05T15:00:00.000Z')
    expect(lastActivityAt(c)).toBe('2026-10-05T15:00:00.000Z')
  })
})
