import type { Client } from './client'

/** Port: persistence of the client aggregate. */
export interface ClientRepository {
  list(): Client[]
  get(id: string): Client | undefined
  /** Inserts or replaces a client by id. */
  save(client: Client): void
  /** Deletes a client by id; returns false when it does not exist. */
  remove(id: string): boolean
  resetToSeed(): void
}
