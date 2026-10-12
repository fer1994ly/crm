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

const PROBE_KEY = '__tiancy_probe__'

/** True when the storage accepts a write (private mode and blocked cookies make setItem throw). */
export function canUseStorage(target: KeyValueStorage): boolean {
  try {
    target.setItem(PROBE_KEY, '1')
    target.removeItem(PROBE_KEY)
    return true
  } catch {
    return false
  }
}

function webStorage(kind: 'local' | 'session'): KeyValueStorage | undefined {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    // Merely reading the property can throw when the browser blocks site data.
    return undefined
  }
}

/** Whether the browser really persists data; false means `browserStorage` is the memory fallback. */
export function isBrowserStorageAvailable(kind: 'local' | 'session' = 'local'): boolean {
  const target = webStorage(kind)
  return target !== undefined && canUseStorage(target)
}

/**
 * Adapter over localStorage / sessionStorage. Falls back to memory when the browser blocks storage
 * (private mode, disabled cookies) so the app keeps working; use `isBrowserStorageAvailable` to tell
 * the user that data will not be kept.
 */
export function browserStorage(kind: 'local' | 'session' = 'local'): KeyValueStorage {
  const target = webStorage(kind)
  return target !== undefined && canUseStorage(target) ? target : createMemoryStorage()
}
