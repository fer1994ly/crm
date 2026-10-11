import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClientRepository } from '../../../app/repositories'
import { useClients } from '../../clients/ui/useClients'
import { STAGE_LABELS } from '../../pipeline/domain/stage'
import { resetDemoData } from '../application/resetDemoData'

export function AdminContacts({ onLock }: { onLock: () => void }) {
  const { clients, refresh } = useClients()
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (confirming) cancelRef.current?.focus()
  }, [confirming])

  function confirmReset() {
    resetDemoData(getClientRepository())
    refresh()
    setConfirming(false)
    setMessage('Datos de ejemplo restablecidos.')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl text-brand">Panel de administración</h1>
          <p className="mt-1 text-sm text-muted">{clients.length} contactos registrados.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="min-h-11 rounded-md border border-brand px-4 text-sm font-semibold text-brand hover:bg-brand/10"
          >
            Restablecer datos de ejemplo
          </button>
          <button
            type="button"
            onClick={onLock}
            className="min-h-11 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Bloquear panel
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm font-medium text-brand">
        {message}
      </p>

      {confirming && (
        <div
          role="alertdialog"
          aria-labelledby="confirmar-titulo"
          aria-describedby="confirmar-detalle"
          className="mt-2 rounded-lg border-2 border-brand bg-surface p-4"
        >
          <h2 id="confirmar-titulo" className="text-lg text-brand">
            ¿Restablecer los datos de ejemplo?
          </h2>
          <p id="confirmar-detalle" className="mt-1 text-sm">
            Se perderán los cambios, notas y clientes nuevos, y se restaurarán los 12 clientes de ejemplo.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              ref={cancelRef}
              type="button"
              onClick={() => setConfirming(false)}
              className="min-h-11 rounded-md border border-line px-4 text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmReset}
              className="min-h-11 rounded-md bg-red-700 px-4 text-sm font-semibold text-white"
            >
              Sí, restablecer
            </button>
          </div>
        </div>
      )}

      <ul aria-label="Contactos" className="mt-4 divide-y divide-line rounded-lg border border-line bg-surface">
        {clients.map((c) => (
          <li key={c.id} className="grid gap-1 p-3 text-sm sm:grid-cols-[2fr_1.5fr_1fr_1fr] sm:items-center">
            <Link to={`/clientes/${c.id}`} className="min-h-11 inline-flex items-center font-semibold text-brand underline">
              {c.institution}
            </Link>
            <span>
              {c.contactName}
              <span className="block text-xs text-muted">{c.email || c.phone}</span>
            </span>
            <span className="text-muted">{c.phone}</span>
            <span className="w-fit rounded-full bg-accent/25 px-2 py-0.5 text-xs font-semibold">
              {STAGE_LABELS[c.stage]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
