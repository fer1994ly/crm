import { deleteClient } from './deleteClient'
import { createLocalStorageClientRepository } from '../infrastructure/localStorageClientRepository'
import { createMemoryStorage } from '../../../shared/storage/keyValueStorage'

describe('deleteClient use case', () => {
  it('removes the client from the repository', () => {
    const storage = createMemoryStorage()
    const repo = createLocalStorageClientRepository(storage)
    const id = repo.list()[2].id
    expect(deleteClient(repo, id)).toBe(true)
    expect(createLocalStorageClientRepository(storage).get(id)).toBeUndefined()
    expect(repo.list()).toHaveLength(11)
  })

  it('returns false for an unknown id', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    expect(deleteClient(repo, 'nope')).toBe(false)
    expect(repo.list()).toHaveLength(12)
  })

  it('keeps an emptied list empty instead of reseeding', () => {
    const storage = createMemoryStorage()
    const repo = createLocalStorageClientRepository(storage)
    for (const c of repo.list()) deleteClient(repo, c.id)
    expect(createLocalStorageClientRepository(storage).list()).toEqual([])
  })
})
