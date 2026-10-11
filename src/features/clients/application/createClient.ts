import type { ClientRepository } from '../domain/clientRepository'
import { validateNewClient, type NewClientInput, type NewClientResult } from '../domain/newClient'

export function createClient(repo: ClientRepository, input: NewClientInput): NewClientResult {
  const result = validateNewClient(input)
  if (result.ok) repo.save(result.client)
  return result
}
