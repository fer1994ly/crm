import { browserStorage, type KeyValueStorage } from '../../../shared/storage/keyValueStorage'
import type { Client } from '../domain/client'
import type { ClientRepository } from '../domain/clientRepository'
import { isValidClient } from '../domain/clientValidation'
import { createSeedClients } from '../domain/seed'

export const CLIENTS_STORAGE_KEY = 'tiancy-crm:v1:clients'

export function createLocalStorageClientRepository(
  storage: KeyValueStorage = browserStorage('local'),
): ClientRepository {
  function write(clients: Client[]): void {
    storage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients))
  }

  /**
   * Load policy for untrusted stored data:
   * - unparseable JSON or a non-list value: reseed;
   * - a list with invalid records: drop them and persist the cleaned list, keeping valid user data;
   * - a non-empty list where no record is valid: reseed; an empty list stays empty.
   */
  function read(): Client[] {
    const raw = storage.getItem(CLIENTS_STORAGE_KEY)
    if (raw !== null) {
      try {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(isValidClient)
          if (valid.length === parsed.length) return valid
          if (valid.length > 0) {
            write(valid)
            return valid
          }
        }
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
    remove(id) {
      const all = read()
      const remaining = all.filter((c) => c.id !== id)
      if (remaining.length === all.length) return false
      write(remaining)
      return true
    },
    resetToSeed() {
      write(createSeedClients())
    },
  }
}
