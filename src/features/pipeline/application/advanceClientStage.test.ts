import { advanceClientStage } from './advanceClientStage'
import { createLocalStorageClientRepository } from '../../clients/infrastructure/localStorageClientRepository'
import { createMemoryStorage } from '../../../shared/storage/keyValueStorage'

describe('advanceClientStage', () => {
  it('moves a client one stage and persists it', () => {
    const storage = createMemoryStorage()
    const repo = createLocalStorageClientRepository(storage)
    const client = repo.list().find((c) => c.stage === 'nuevo-contacto')!
    const updated = advanceClientStage(repo, client.id, '2026-10-10T15:00:00.000Z')
    expect(updated.stage).toBe('cotizacion-enviada')
    expect(createLocalStorageClientRepository(storage).get(client.id)?.stage).toBe('cotizacion-enviada')
  })

  it('rejects closed orders and unknown ids', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    const closed = repo.list().find((c) => c.stage === 'pedido-cerrado')!
    expect(() => advanceClientStage(repo, closed.id)).toThrow()
    expect(repo.get(closed.id)?.stage).toBe('pedido-cerrado')
    expect(() => advanceClientStage(repo, 'no-existe')).toThrow(/no existe/i)
  })
})
