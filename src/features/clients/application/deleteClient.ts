import type { ClientRepository } from '../domain/clientRepository'

/** Permanently removes a client; returns false when the id is unknown. */
export function deleteClient(repo: ClientRepository, id: string): boolean {
  return repo.remove(id)
}
