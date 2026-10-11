import type { KeyValueStorage } from '../../../shared/storage/keyValueStorage'
import { ADMIN_PASSWORD, ADMIN_SESSION_KEY } from '../domain/config'

export interface AdminAuth {
  isUnlocked(): boolean
  unlock(password: string): boolean
  lock(): void
}

/** Session-scoped unlock flag: pass sessionStorage in the browser. */
export function createAdminAuth(sessionStorage: KeyValueStorage): AdminAuth {
  return {
    isUnlocked: () => sessionStorage.getItem(ADMIN_SESSION_KEY) === '1',
    unlock(password) {
      if (password !== ADMIN_PASSWORD) return false
      sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
      return true
    },
    lock: () => sessionStorage.removeItem(ADMIN_SESSION_KEY),
  }
}
