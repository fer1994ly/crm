import { validateClientDetails } from './clientDetails'
import type { NewClientInput } from './newClient'

const input: NewClientInput = {
  institution: ' Clínica Horizonte ',
  contactName: 'Marta Solís',
  phone: '24418899',
  email: '',
  product: 'Camillas',
  quantity: '3',
  estimatedValue: '1500000',
}

describe('validateClientDetails', () => {
  it('returns trimmed, normalized details for valid input', () => {
    const result = validateClientDetails(input)
    expect(result).toEqual({
      ok: true,
      details: {
        institution: 'Clínica Horizonte',
        contactName: 'Marta Solís',
        phone: '+506 2441-8899',
        email: '',
        product: 'Camillas',
        quantity: 3,
        estimatedValueCrc: 1500000,
      },
    })
  })

  it('reuses the creation rules for required fields, quantity and contact format', () => {
    const result = validateClientDetails({ ...input, institution: '', quantity: '0', phone: '12', email: '' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.institution).toBe('Ingrese el nombre de la institución.')
      expect(result.errors.quantity).toBe('Ingrese una cantidad entera mayor que 0.')
      expect(result.errors.phone).toMatch(/teléfono válido/)
    }
  })

  it('requires a phone or an email', () => {
    const result = validateClientDetails({ ...input, phone: '', email: '' })
    expect(result.ok).toBe(false)
  })
})
