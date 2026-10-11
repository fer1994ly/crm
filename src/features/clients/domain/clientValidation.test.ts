import { isValidClient } from './clientValidation'
import { createSeedClients } from './seed'

const valid = createSeedClients()[0]

describe('isValidClient', () => {
  it('accepts every seed client', () => {
    for (const client of createSeedClients()) expect(isValidClient(client)).toBe(true)
  })

  it('accepts empty phone/email and an estimated value of 0', () => {
    expect(isValidClient({ ...valid, phone: '', email: '', estimatedValueCrc: 0 })).toBe(true)
  })

  it.each([
    ['null', null],
    ['a string', 'client'],
    ['an array', []],
    ['an empty history', { ...valid, history: [] }],
    ['an unknown stage', { ...valid, stage: 'archivado' }],
    ['a missing institution', { ...valid, institution: undefined }],
    ['an empty id', { ...valid, id: '' }],
    ['a non-string product', { ...valid, product: 4 }],
    ['a zero quantity', { ...valid, quantity: 0 }],
    ['a fractional quantity', { ...valid, quantity: 2.5 }],
    ['a string quantity', { ...valid, quantity: '3' }],
    ['a negative estimated value', { ...valid, estimatedValueCrc: -1 }],
    ['a NaN estimated value', { ...valid, estimatedValueCrc: Number.NaN }],
    ['a history entry with an unparseable date', { ...valid, history: [{ ...valid.history[0], at: 'ayer' }] }],
    ['a history entry with an unknown kind', { ...valid, history: [{ ...valid.history[0], kind: 'fax' }] }],
    ['a history entry without text', { ...valid, history: [{ ...valid.history[0], text: undefined }] }],
    ['a non-object history entry', { ...valid, history: [null] }],
  ])('rejects %s', (_label, value) => {
    expect(isValidClient(value)).toBe(false)
  })
})
