import { createClient } from './createClient'
import { createLocalStorageClientRepository } from '../infrastructure/localStorageClientRepository'
import { createMemoryStorage } from '../../../shared/storage/keyValueStorage'
import type { NewClientInput } from '../domain/newClient'

const input: NewClientInput = {
  institution: 'Centro de Salud Horizonte',
  contactName: 'Marta Solís',
  phone: '+506 2441-8899',
  email: '',
  product: 'Camillas',
  quantity: '3',
  estimatedValue: '1500000',
}

describe('createClient use case', () => {
  it('persists a valid client', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    const result = createClient(repo, input)
    expect(result.ok).toBe(true)
    expect(repo.list()).toHaveLength(13)
    if (result.ok) expect(repo.get(result.client.id)?.stage).toBe('nuevo-contacto')
  })

  it('does not persist an invalid client', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    const result = createClient(repo, { ...input, institution: '' })
    expect(result.ok).toBe(false)
    expect(repo.list()).toHaveLength(12)
  })
})
