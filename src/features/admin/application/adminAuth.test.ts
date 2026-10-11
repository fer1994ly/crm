import { createAdminAuth } from './adminAuth'
import { ADMIN_PASSWORD } from '../domain/config'
import { createMemoryStorage } from '../../../shared/storage/keyValueStorage'

describe('admin auth', () => {
  it('starts locked', () => {
    expect(createAdminAuth(createMemoryStorage()).isUnlocked()).toBe(false)
  })

  it('rejects a wrong password', () => {
    const auth = createAdminAuth(createMemoryStorage())
    expect(auth.unlock('incorrecta')).toBe(false)
    expect(auth.isUnlocked()).toBe(false)
  })

  it('unlocks with the configured password and survives a new instance on the same storage', () => {
    const storage = createMemoryStorage()
    expect(createAdminAuth(storage).unlock(ADMIN_PASSWORD)).toBe(true)
    expect(createAdminAuth(storage).isUnlocked()).toBe(true)
  })

  it('locks again', () => {
    const storage = createMemoryStorage()
    const auth = createAdminAuth(storage)
    auth.unlock(ADMIN_PASSWORD)
    auth.lock()
    expect(createAdminAuth(storage).isUnlocked()).toBe(false)
  })

  it('uses the documented demo password', () => {
    expect(ADMIN_PASSWORD).toBe('tiancy2026')
  })
})
