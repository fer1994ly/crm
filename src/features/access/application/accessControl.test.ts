import { createAccessControl } from './accessControl'
import { ACCESS_PASSWORD } from '../domain/config'
import { createMemoryStorage } from '../../../shared/storage/keyValueStorage'

describe('access control', () => {
  it('starts locked', () => {
    expect(createAccessControl(createMemoryStorage()).isUnlocked()).toBe(false)
  })

  it('rejects a wrong or empty password', () => {
    const access = createAccessControl(createMemoryStorage())
    expect(access.unlock('incorrecta')).toBe(false)
    expect(access.unlock('')).toBe(false)
    expect(access.isUnlocked()).toBe(false)
  })

  it('unlocks with the configured password and survives a new instance on the same storage', () => {
    const storage = createMemoryStorage()
    expect(createAccessControl(storage).unlock(ACCESS_PASSWORD)).toBe(true)
    expect(createAccessControl(storage).isUnlocked()).toBe(true)
  })

  it('locks again', () => {
    const storage = createMemoryStorage()
    const access = createAccessControl(storage)
    access.unlock(ACCESS_PASSWORD)
    access.lock()
    expect(createAccessControl(storage).isUnlocked()).toBe(false)
  })

  it('uses the documented demo password', () => {
    expect(ACCESS_PASSWORD).toBe('tiancy2026')
  })
})
