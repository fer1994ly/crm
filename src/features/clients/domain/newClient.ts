import { newId } from '../../../shared/ids'
import { nowIso } from '../../../shared/dates'
import { createHistoryEntry, type Client } from './client'
import { validateClientDetails } from './clientDetails'

export interface NewClientInput {
  institution: string
  contactName: string
  phone: string
  email: string
  product: string
  quantity: string
  estimatedValue: string
}

export type NewClientField = keyof NewClientInput
export type NewClientErrors = Partial<Record<NewClientField, string>>

export type NewClientResult = { ok: true; client: Client } | { ok: false; errors: NewClientErrors }

interface Context {
  id?: string
  at?: string
}

export function validateNewClient(input: NewClientInput, context: Context = {}): NewClientResult {
  const result = validateClientDetails(input)
  if (!result.ok) return result

  const at = context.at ?? nowIso()
  return {
    ok: true,
    client: {
      id: context.id ?? newId('cli'),
      ...result.details,
      stage: 'nuevo-contacto',
      history: [createHistoryEntry('note', 'Cliente registrado en el pipeline.', at)],
    },
  }
}
