import { browserStorage, type KeyValueStorage } from '../../../shared/storage/keyValueStorage'
import type { Client } from '../domain/client'
import type { ClientRepository } from '../domain/clientRepository'
import { createSeedClients } from '../domain/seed'

export const CLIENTS_STORAGE_KEY = 'tiancy-crm:v1:clients'

function isClientList(value: unknown): value is Client[] {
  return (
    Array.isArray(value) &&
    value.every(
      (c) => typeof c === 'object' && c !== null && typeof c.id === 'string' && Array.isArray(c.history),
    )
  )
}

export function createLocalStorageClientRepository(
  storage: KeyValueStorage = browserStorage('local'),
): ClientRepository {
  function write(clients: Client[]): void {
    storage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients))
  }

  function read(): Client[] {
    const raw = storage.getItem(CLIENTS_STORAGE_KEY)
    if (raw !== null) {
      try {
        const parsed: unknown = JSON.parse(raw)
        if (isClientList(parsed)) return parsed
      } catch {
        // Corrupt data falls through to a fresh seed below.
      }
    }
    const seed = createSeedClients()
    write(seed)
    return seed
  }

  return {
    list: read,
    get: (id) => read().find((c) => c.id === id),
    save(client) {
      const all = read()
      const index = all.findIndex((c) => c.id === client.id)
      if (index === -1) all.push(client)
      else all[index] = client
      write(all)
    },
    resetToSeed() {
      write(createSeedClients())
    },
  }
}
