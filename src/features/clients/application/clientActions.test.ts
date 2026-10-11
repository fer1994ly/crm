import { addClientNote, getClient, sendSimulatedContact } from './clientActions'
import { createLocalStorageClientRepository } from '../infrastructure/localStorageClientRepository'
import { createMemoryStorage } from '../../../shared/storage/keyValueStorage'

describe('client use cases', () => {
  it('adds a note and persists it', () => {
    const storage = createMemoryStorage()
    const repo = createLocalStorageClientRepository(storage)
    const id = repo.list()[0].id
    const before = repo.get(id)!.history.length
    addClientNote(repo, id, 'Confirmar visita técnica', '2026-10-10T15:00:00.000Z')
    const stored = createLocalStorageClientRepository(storage).get(id)!
    expect(stored.history).toHaveLength(before + 1)
    expect(stored.history.at(-1)?.text).toBe('Confirmar visita técnica')
  })

  it('logs a simulated contact', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    const id = repo.list()[0].id
    const updated = sendSimulatedContact(repo, id, 'email', '2026-10-10T15:00:00.000Z')
    expect(updated.history.at(-1)?.text).toContain('Correo simulado enviado')
  })

  it('throws for unknown clients and returns undefined from getClient', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    expect(() => addClientNote(repo, 'nope', 'hola')).toThrow(/no existe/i)
    expect(getClient(repo, 'nope')).toBeUndefined()
  })
})
