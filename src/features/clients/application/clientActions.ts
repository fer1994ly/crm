import { nowIso } from '../../../shared/dates'
import { addNote, logSimulatedContact, type Client, type SimulatedChannel } from '../domain/client'
import type { ClientRepository } from '../domain/clientRepository'

export function getClient(repo: ClientRepository, id: string): Client | undefined {
  return repo.get(id)
}

function update(repo: ClientRepository, id: string, change: (client: Client) => Client): Client {
  const client = repo.get(id)
  if (!client) throw new Error('El cliente no existe.')
  const updated = change(client)
  repo.save(updated)
  return updated
}

export function addClientNote(repo: ClientRepository, id: string, text: string, at: string = nowIso()): Client {
  return update(repo, id, (c) => addNote(c, text, at))
}

export function sendSimulatedContact(
  repo: ClientRepository,
  id: string,
  channel: SimulatedChannel,
  at: string = nowIso(),
): Client {
  return update(repo, id, (c) => logSimulatedContact(c, channel, at))
}
