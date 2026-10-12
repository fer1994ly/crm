import { updateClientDetails } from './updateClientDetails'
import { createLocalStorageClientRepository } from '../infrastructure/localStorageClientRepository'
import { createMemoryStorage } from '../../../shared/storage/keyValueStorage'
import type { NewClientInput } from '../domain/newClient'

const input: NewClientInput = {
  institution: 'Clínica Editada',
  contactName: 'Ana Mora',
  phone: '',
  email: 'ana@editada.cr',
  product: 'Monitores',
  quantity: '5',
  estimatedValue: '',
}

describe('updateClientDetails use case', () => {
  it('persists the edited details and keeps stage and history intact', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    const before = repo.list()[3]
    const result = updateClientDetails(repo, before.id, input)
    expect(result.ok).toBe(true)
    const after = repo.get(before.id)!
    expect(after.institution).toBe('Clínica Editada')
    expect(after.quantity).toBe(5)
    expect(after.estimatedValueCrc).toBe(0)
    expect(after.stage).toBe(before.stage)
    expect(after.history).toEqual(before.history)
    expect(repo.list()).toHaveLength(12)
  })

  it('does not persist invalid details', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    const before = repo.list()[0]
    const result = updateClientDetails(repo, before.id, { ...input, institution: '' })
    expect(result.ok).toBe(false)
    expect(repo.get(before.id)).toEqual(before)
  })

  it('reports an unknown client', () => {
    const repo = createLocalStorageClientRepository(createMemoryStorage())
    expect(updateClientDetails(repo, 'nope', input)).toEqual({ ok: false, notFound: true })
  })
})
