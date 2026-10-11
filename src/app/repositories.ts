import { createLocalStorageClientRepository } from '../features/clients/infrastructure/localStorageClientRepository'
import type { ClientRepository } from '../features/clients/domain/clientRepository'

let instance: ClientRepository | undefined

/** Composition root: the single place that picks the persistence adapter. */
export function getClientRepository(): ClientRepository {
  instance ??= createLocalStorageClientRepository()
  return instance
}
