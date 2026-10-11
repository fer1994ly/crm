import { useEffect, useRef, useState } from 'react'
import { getClientRepository } from '../../../app/repositories'
import { resetDemoData } from '../application/resetDemoData'
import { useAccess } from './AccessContext'

const itemClass =
  'flex min-h-11 w-full items-center rounded-md px-3 text-left text-sm font-medium text-brand-dark hover:bg-canvas'

/** Header account area: reset the sample data (with an in-page confirmation) and lock the app. */
export function AccountMenu({ onDataReset }: { onDataReset: () => void }) {
  const { lock } = useAccess()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!confirming) return
    cancelRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setConfirming(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [confirming])

  function cancel() {
    setConfirming(false)
    triggerRef.current?.focus()
  }

  function confirmReset() {
    resetDemoData(getClientRepository())
    setConfirming(false)
    onDataReset()
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((value) => !value)}
        className="min-h-11 inline-flex items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-white/10 aria-expanded:bg-white/20"
      >
        Cuenta
        <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-current stroke-2">
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div
          id="account-menu"
          className="absolute right-0 top-full z-30 mt-1 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-surface p-1 shadow-lg"
        >
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              setOpen(false)
              setConfirming(true)
            }}
          >
            Restablecer datos de ejemplo
          </button>
          <button type="button" className={itemClass} onClick={lock}>
            Cerrar sesión
          </button>
        </div>
      )}
      {confirming && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-brand-dark/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmar-titulo"
            aria-describedby="confirmar-detalle"
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-lg border-2 border-brand bg-surface p-4 text-brand-dark"
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
                onClick={cancel}
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
        </div>
      )}
    </div>
  )
}
