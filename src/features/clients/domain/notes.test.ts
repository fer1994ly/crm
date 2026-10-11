import { addNote, logSimulatedContact, type Client } from './client'

const base: Client = {
  id: 'c1',
  institution: 'Clínica Prueba',
  contactName: 'Ana Mora',
  phone: '+506 2222-3333',
  email: 'ana@clinicaprueba.cr',
  product: 'Oxímetros',
  quantity: 4,
  estimatedValueCrc: 100000,
  stage: 'nuevo-contacto',
  history: [],
}

describe('addNote', () => {
  it('appends a trimmed note with its date', () => {
    const next = addNote(base, '  Llamar el lunes  ', '2026-10-05T15:00:00.000Z')
    expect(next.history).toHaveLength(1)
    expect(next.history[0]).toMatchObject({ kind: 'note', text: 'Llamar el lunes', at: '2026-10-05T15:00:00.000Z' })
  })

  it('rejects an empty note', () => {
    expect(() => addNote(base, '   ', '2026-10-05T15:00:00.000Z')).toThrow(/nota/i)
  })
})

describe('logSimulatedContact', () => {
  it('logs a simulated email', () => {
    const next = logSimulatedContact(base, 'email', '2026-10-05T15:00:00.000Z')
    expect(next.history[0].kind).toBe('email')
    expect(next.history[0].text).toContain('Correo simulado enviado')
  })

  it('logs a simulated WhatsApp message', () => {
    const next = logSimulatedContact(base, 'whatsapp', '2026-10-05T15:00:00.000Z')
    expect(next.history[0].kind).toBe('whatsapp')
    expect(next.history[0].text).toContain('WhatsApp simulado enviado')
  })
})
