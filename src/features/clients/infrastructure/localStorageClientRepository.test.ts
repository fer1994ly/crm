import { createLocalStorageClientRepository, CLIENTS_STORAGE_KEY } from './localStorageClientRepository'
import { createMemoryStorage } from '../../../shared/storage/keyValueStorage'
import { createSeedClients } from '../domain/seed'

describe('localStorage client repository', () => {
  it('uses a versioned key', () => {
    expect(CLIENTS_STORAGE_KEY).toMatch(/:v\d+:/)
  })

  it('seeds on first load and persists the seed', () => {
    const storage = createMemoryStorage()
    const repo = createLocalStorageClientRepository(storage)
    expect(repo.list()).toHaveLength(12)
    expect(storage.getItem(CLIENTS_STORAGE_KEY)).not.toBeNull()
  })

  it('persists saved changes across repository instances', () => {
    const storage = createMemoryStorage()
    const repo = createLocalStorageClientRepository(storage)
    const first = repo.list()[0]
    repo.save({ ...first, product: 'Producto actualizado' })
    const again = createLocalStorageClientRepository(storage)
    expect(again.get(first.id)?.product).toBe('Producto actualizado')
    expect(again.list()).toHaveLength(12)
  })

  it('appends a new client on save', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    const seed = createSeedClients()[0]
    repo.save({ ...seed, id: 'nuevo-1' })
    expect(repo.list()).toHaveLength(13)
  })

  it('reseeds when stored data is corrupt', () => {
    const storage = createMemoryStorage()
    storage.setItem(CLIENTS_STORAGE_KEY, '{not json')
    expect(createLocalStorageClientRepository(storage).list()).toHaveLength(12)
  })

  it('resets to the demo data', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    repo.save({ ...repo.list()[0], product: 'Cambiado' })
    repo.resetToSeed()
    expect(repo.list()[0].product).not.toBe('Cambiado')
    expect(repo.list()).toHaveLength(12)
  })
})
