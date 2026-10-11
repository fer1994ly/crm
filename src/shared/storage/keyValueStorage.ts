/** Port: minimal synchronous key/value storage (matches the Web Storage API). */
export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function createMemoryStorage(): KeyValueStorage {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

/**
 * Adapter over localStorage / sessionStorage. Falls back to memory when the
 * browser blocks storage (private mode, disabled cookies) so the app keeps working.
 */
export function browserStorage(kind: 'local' | 'session' = 'local'): KeyValueStorage {
  try {
    const target = kind === 'local' ? window.localStorage : window.sessionStorage
    const probe = '__tiancy_probe__'
    target.setItem(probe, '1')
    target.removeItem(probe)
    return target
  } catch {
    return createMemoryStorage()
  }
}
