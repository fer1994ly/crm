import { validateNewClient, type NewClientInput } from './newClient'

const valid: NewClientInput = {
  institution: 'Clínica Horizonte – Alajuela',
  contactName: 'Marta Solís',
  phone: '2441-8899',
  email: '',
  product: 'Oxímetros de pulso',
  quantity: '8',
  estimatedValue: '',
}

describe('validateNewClient', () => {
  it('accepts a valid input and builds a client at Nuevo contacto', () => {
    const result = validateNewClient(valid, { id: 'cli-x', at: '2026-10-10T15:00:00.000Z' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.client).toMatchObject({
      id: 'cli-x',
      institution: 'Clínica Horizonte – Alajuela',
      stage: 'nuevo-contacto',
      quantity: 8,
      phone: '+506 2441-8899',
      estimatedValueCrc: 0,
    })
    expect(result.client.history).toHaveLength(1)
    expect(result.client.history[0].at).toBe('2026-10-10T15:00:00.000Z')
  })

  it('accepts an email without a phone', () => {
    const result = validateNewClient({ ...valid, phone: '', email: 'marta@horizonte.cr' })
    expect(result.ok).toBe(true)
  })

  it('reports every missing required field in Spanish', () => {
    const result = validateNewClient({
      institution: '',
      contactName: ' ',
      phone: '',
      email: '',
      product: '',
      quantity: '',
      estimatedValue: '',
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors).toEqual({
      institution: 'Ingrese el nombre de la institución.',
      contactName: 'Ingrese la persona de contacto.',
      phone: 'Ingrese un teléfono o un correo electrónico.',
      email: 'Ingrese un teléfono o un correo electrónico.',
      product: 'Ingrese el producto de interés.',
      quantity: 'Ingrese una cantidad entera mayor que 0.',
    })
  })

  it.each(['0', '-3', '2.5', 'abc'])('rejects quantity %s', (quantity) => {
    const result = validateNewClient({ ...valid, quantity })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.quantity).toBe('Ingrese una cantidad entera mayor que 0.')
  })

  it('rejects malformed phone and email', () => {
    const result = validateNewClient({ ...valid, phone: '12345', email: 'sin-arroba' })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.phone).toBe('Ingrese un teléfono válido, por ejemplo +506 2222-3333.')
    expect(result.errors.email).toBe('Ingrese un correo válido, por ejemplo nombre@institucion.cr.')
  })

  it('rejects a negative or non-numeric estimated value', () => {
    const result = validateNewClient({ ...valid, estimatedValue: '-5' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.estimatedValue).toBe('Ingrese un monto en colones sin decimales.')
  })
})
