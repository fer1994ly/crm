import type { KeyValueStorage } from '../../../shared/storage/keyValueStorage'
import { ACCESS_PASSWORD, ACCESS_SESSION_KEY } from '../domain/config'

export interface AccessControl {
  isUnlocked(): boolean
  unlock(password: string): boolean
  lock(): void
}

/** Session-scoped unlock flag: pass sessionStorage in the browser. */
export function createAccessControl(sessionStorage: KeyValueStorage): AccessControl {
  return {
    isUnlocked: () => sessionStorage.getItem(ACCESS_SESSION_KEY) === '1',
    unlock(password) {
      if (password !== ACCESS_PASSWORD) return false
      sessionStorage.setItem(ACCESS_SESSION_KEY, '1')
      return true
    },
    lock: () => sessionStorage.removeItem(ACCESS_SESSION_KEY),
  }
}
