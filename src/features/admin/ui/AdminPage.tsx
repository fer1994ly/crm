import { useState, type FormEvent } from 'react'
import { browserStorage } from '../../../shared/storage/keyValueStorage'
import { createAdminAuth } from '../application/adminAuth'
import { AdminContacts } from './AdminContacts'

/** Gate only: contact data lives in AdminContacts, which is not mounted (nor read) until unlocked. */
export function AdminPage() {
  const [auth] = useState(() => createAdminAuth(browserStorage('session')))
  const [unlocked, setUnlocked] = useState(() => auth.isUnlocked())
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (auth.unlock(password)) {
      setUnlocked(true)
      setError('')
    } else {
      setError('Contraseña incorrecta.')
    }
    setPassword('')
  }

  function lock() {
    auth.lock()
    setUnlocked(false)
  }

  if (unlocked) return <AdminContacts onLock={lock} />

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl text-brand">Panel de administración</h1>
      <p className="mt-1 text-sm text-muted">Ingrese la contraseña para ver los contactos.</p>
      <form onSubmit={submit} className="mt-4 space-y-3 rounded-lg border border-line bg-surface p-4">
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'admin-error' : undefined}
            className="mt-1 min-h-11 w-full rounded-md border border-line p-2 text-base"
          />
          {error && (
            <p id="admin-error" role="alert" className="mt-1 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="min-h-11 w-full rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}
