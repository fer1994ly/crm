import { createMemoryStorage, browserStorage, canUseStorage, isBrowserStorageAvailable } from './keyValueStorage'

const failingStorage = {
  getItem: () => null,
  setItem: () => {
    throw new DOMException('blocked', 'SecurityError')
  },
  removeItem: () => undefined,
}

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

describe('canUseStorage', () => {
  it('is true for a working storage and leaves no probe key behind', () => {
    const s = createMemoryStorage()
    expect(canUseStorage(s)).toBe(true)
    expect(s.getItem('__tiancy_probe__')).toBeNull()
  })

  it('is false when writing throws', () => {
    expect(canUseStorage(failingStorage)).toBe(false)
  })
})

describe('isBrowserStorageAvailable', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is true when localStorage and sessionStorage work', () => {
    expect(isBrowserStorageAvailable('local')).toBe(true)
    expect(isBrowserStorageAvailable('session')).toBe(true)
  })

  it('is false, and browserStorage falls back to memory, when the browser blocks writes', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    expect(isBrowserStorageAvailable('local')).toBe(false)
    const fallback = browserStorage('local')
    fallback.setItem('k', 'v')
    expect(fallback.getItem('k')).toBe('v')
  })
})
