import type { ClientRepository } from '../domain/clientRepository'
import { validateClientDetails } from '../domain/clientDetails'
import type { NewClientErrors, NewClientInput } from '../domain/newClient'

export type UpdateClientDetailsResult =
  | { ok: true }
  | { ok: false; notFound: true }
  | { ok: false; errors: NewClientErrors }

/** Edits the contact fields of a client; stage, history and id are never touched. */
export function updateClientDetails(
  repo: ClientRepository,
  id: string,
  input: NewClientInput,
): UpdateClientDetailsResult {
  const client = repo.get(id)
  if (!client) return { ok: false, notFound: true }
  const result = validateClientDetails(input)
  if (!result.ok) return result
  repo.save({ ...client, ...result.details })
  return { ok: true }
}
