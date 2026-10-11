import { advanceClient, type Client } from '../../clients/domain/client'
import type { ClientRepository } from '../../clients/domain/clientRepository'
import { nowIso } from '../../../shared/dates'

export function advanceClientStage(repo: ClientRepository, clientId: string, at: string = nowIso()): Client {
  const client = repo.get(clientId)
  if (!client) throw new Error('El cliente no existe.')
  const updated = advanceClient(client, at)
  repo.save(updated)
  return updated
}
