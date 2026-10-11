import type { Client } from './client'

/** Port: persistence of the client aggregate. */
export interface ClientRepository {
  list(): Client[]
  get(id: string): Client | undefined
  /** Inserts or replaces a client by id. */
  save(client: Client): void
  resetToSeed(): void
}
