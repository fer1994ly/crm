import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { browserStorage } from '../../../shared/storage/keyValueStorage'
import { createAccessControl } from '../application/accessControl'
import { ACCESS_PASSWORD } from '../domain/config'
import { AccessContext } from './AccessContext'

/**
 * Renders its children only after the access password was entered. Until then nothing below the gate
 * is mounted, so no page (and no contact data) is loaded or read.
 */
export function AccessGate({ children }: { children: ReactNode }) {
  const [access] = useState(() => createAccessControl(browserStorage('session')))
  const [unlocked, setUnlocked] = useState(() => access.isUnlocked())
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const context = useMemo(
    () => ({
      lock() {
        access.lock()
        setUnlocked(false)
      },
    }),
    [access],
  )

  function submit(event: FormEvent) {
    event.preventDefault()
    if (access.unlock(password)) {
      setUnlocked(true)
      setError('')
    } else {
      setError('Clave incorrecta.')
    }
    setPassword('')
  }

  if (unlocked) return <AccessContext.Provider value={context}>{children}</AccessContext.Provider>

  return (
    <div className="min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-sm">
        <p className="font-heading text-lg font-bold tracking-tight text-brand">Tiancy Médica</p>
        <h1 className="mt-4 text-2xl text-brand">Acceso</h1>
        <p className="mt-1 text-sm text-muted">Ingrese la clave de acceso para ver los contactos.</p>
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-lg border border-line bg-surface p-4">
          <div>
            <label htmlFor="access-password" className="block text-sm font-medium">
              Clave de acceso
            </label>
            <input
              id="access-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'access-error' : undefined}
              className="mt-1 min-h-11 w-full rounded-md border border-line p-2 text-base"
            />
            {error && (
              <p id="access-error" role="alert" className="mt-1 text-sm font-medium text-red-700">
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
        <p className="mt-3 text-sm text-muted">Clave de demostración: {ACCESS_PASSWORD}</p>
      </div>
    </div>
  )
}
