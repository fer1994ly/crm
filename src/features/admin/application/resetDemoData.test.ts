import { resetDemoData } from './resetDemoData'
import { createLocalStorageClientRepository } from '../../clients/infrastructure/localStorageClientRepository'
import { createMemoryStorage } from '../../../shared/storage/keyValueStorage'

describe('resetDemoData', () => {
  it('restores the 12 seed clients and drops changes', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    const first = repo.list()[0]
    repo.save({ ...first, stage: 'pedido-cerrado' })
    repo.save({ ...first, id: 'extra-1' })
    resetDemoData(repo)
    expect(repo.list()).toHaveLength(12)
    expect(repo.get(first.id)?.stage).toBe(first.stage)
    expect(repo.get('extra-1')).toBeUndefined()
  })
})
