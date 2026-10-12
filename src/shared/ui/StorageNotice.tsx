import { useState } from 'react'
import { isBrowserStorageAvailable } from '../storage/keyValueStorage'

/** Non-blocking warning shown only when the browser blocks local storage (data is kept in memory). */
export function StorageNotice() {
  const [blocked] = useState(() => !isBrowserStorageAvailable('local'))
  if (!blocked) return null
  return (
    <p role="status" className="mb-3 rounded-md border border-amber-700 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-950">
      Tu navegador está bloqueando el almacenamiento local: los cambios no se guardarán al cerrar o recargar la página.
    </p>
  )
}
