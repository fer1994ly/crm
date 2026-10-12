import type { Client } from './client'
import type { NewClientErrors, NewClientInput } from './newClient'

/** The user-editable fields of a client (everything except id, stage and history). */
export type ClientDetails = Pick<
  Client,
  'institution' | 'contactName' | 'phone' | 'email' | 'product' | 'quantity' | 'estimatedValueCrc'
>

export type ClientDetailsResult = { ok: true; details: ClientDetails } | { ok: false; errors: NewClientErrors }

const PHONE_PATTERN = /^(?:\+?506[\s-]?)?(\d{4})[\s-]?(\d{4})$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Single source of truth for the field rules, shared by creation and editing. */
export function validateClientDetails(input: NewClientInput): ClientDetailsResult {
  const errors: NewClientErrors = {}
  const institution = input.institution.trim()
  const contactName = input.contactName.trim()
  const product = input.product.trim()
  const phone = input.phone.trim()
  const email = input.email.trim()
  const quantityText = input.quantity.trim()
  const valueText = input.estimatedValue.trim()

  if (!institution) errors.institution = 'Ingrese el nombre de la institución.'
  if (!contactName) errors.contactName = 'Ingrese la persona de contacto.'
  if (!product) errors.product = 'Ingrese el producto de interés.'

  let normalizedPhone = ''
  if (!phone && !email) {
    errors.phone = 'Ingrese un teléfono o un correo electrónico.'
    errors.email = 'Ingrese un teléfono o un correo electrónico.'
  }
  if (phone) {
    const match = PHONE_PATTERN.exec(phone)
    if (match) normalizedPhone = `+506 ${match[1]}-${match[2]}`
    else errors.phone = 'Ingrese un teléfono válido, por ejemplo +506 2222-3333.'
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = 'Ingrese un correo válido, por ejemplo nombre@institucion.cr.'
  }

  const quantity = Number(quantityText)
  if (!/^\d+$/.test(quantityText) || !Number.isInteger(quantity) || quantity <= 0) {
    errors.quantity = 'Ingrese una cantidad entera mayor que 0.'
  }

  let estimatedValueCrc = 0
  if (valueText) {
    if (/^\d+$/.test(valueText)) estimatedValueCrc = Number(valueText)
    else errors.estimatedValue = 'Ingrese un monto en colones sin decimales.'
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    details: { institution, contactName, phone: normalizedPhone, email, product, quantity, estimatedValueCrc },
  }
}
