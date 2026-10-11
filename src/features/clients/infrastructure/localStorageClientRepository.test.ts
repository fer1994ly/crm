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

describe('localStorage client repository: stored shape validation', () => {
  const seed = createSeedClients()
  const custom = { ...seed[0], id: 'custom-1', institution: 'Clínica Propia' }

  it('reseeds when the stored value is not a list', () => {
    const storage = createMemoryStorage()
    storage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify({ clients: [] }))
    expect(createLocalStorageClientRepository(storage).list()).toHaveLength(12)
  })

  it('drops invalid records, keeps valid ones, and persists the cleaned list', () => {
    const storage = createMemoryStorage()
    const broken = [
      custom,
      { ...seed[1], id: 'bad-history', history: [] },
      { ...seed[2], id: 'bad-stage', stage: 'archivado' },
      { id: 'bad-fields' },
    ]
    storage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(broken))
    const repo = createLocalStorageClientRepository(storage)
    expect(repo.list().map((c) => c.id)).toEqual(['custom-1'])
    expect(JSON.parse(storage.getItem(CLIENTS_STORAGE_KEY)!).map((c: { id: string }) => c.id)).toEqual(['custom-1'])
  })

  it('reseeds when every stored record is invalid', () => {
    const storage = createMemoryStorage()
    storage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify([{ id: 'x', history: [] }]))
    expect(createLocalStorageClientRepository(storage).list()).toHaveLength(12)
  })

  it('keeps an intentionally empty list empty', () => {
    const storage = createMemoryStorage()
    storage.setItem(CLIENTS_STORAGE_KEY, '[]')
    expect(createLocalStorageClientRepository(storage).list()).toEqual([])
  })
})
