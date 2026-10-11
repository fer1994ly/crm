import { createMemoryStorage, browserStorage } from './keyValueStorage'

describe('createMemoryStorage', () => {
  it('stores, reads and removes values', () => {
    const s = createMemoryStorage()
    expect(s.getItem('a')).toBeNull()
    s.setItem('a', '1')
    expect(s.getItem('a')).toBe('1')
    s.removeItem('a')
    expect(s.getItem('a')).toBeNull()
  })
})

describe('browserStorage', () => {
  it('delegates to localStorage', () => {
    const s = browserStorage('local')
    s.setItem('k', 'v')
    expect(localStorage.getItem('k')).toBe('v')
  })

  it('delegates to sessionStorage', () => {
    browserStorage('session').setItem('k', 'v')
    expect(sessionStorage.getItem('k')).toBe('v')
  })
})
