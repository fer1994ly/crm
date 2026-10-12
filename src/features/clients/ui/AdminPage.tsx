import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getClientRepository } from '../../../app/repositories'
import { STAGE_LABELS } from '../../pipeline/domain/stage'
import { formatCrc } from '../../../shared/money'
import { deleteClient } from '../application/deleteClient'
import { updateClientDetails } from '../application/updateClientDetails'
import type { Client } from '../domain/client'
import type { NewClientErrors, NewClientField, NewClientInput } from '../domain/newClient'
import { CLIENT_FIELDS, ClientFormFields } from './ClientFormFields'
import { useClients } from './useClients'

function toInput(client: Client): NewClientInput {
  return {
    institution: client.institution,
    contactName: client.contactName,
    phone: client.phone,
    email: client.email,
    product: client.product,
    quantity: String(client.quantity),
    estimatedValue: client.estimatedValueCrc > 0 ? String(client.estimatedValueCrc) : '',
  }
}

function Row({ label, children }: { label: string; children: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right">{children}</dd>
    </div>
  )
}

function ContactCard({ client, onEdit, onDelete }: { client: Client; onEdit: () => void; onDelete: () => void }) {
  return (
    <article aria-label={client.institution} className="rounded-lg border border-line bg-surface p-4 shadow-sm">
      <h2 className="break-words text-base leading-snug text-brand">{client.institution}</h2>
      <p className="mt-1">
        <span
          data-testid="stage-badge"
          className="inline-block rounded-full bg-accent/25 px-3 py-1 text-xs font-semibold text-brand-dark"
        >
          {STAGE_LABELS[client.stage]}
        </span>
      </p>
      <dl className="mt-2 space-y-1 text-sm">
        <Row label="Contacto">{client.contactName}</Row>
        <Row label="Teléfono">{client.phone || 'Sin teléfono'}</Row>
        <Row label="Correo">{client.email || 'Sin correo'}</Row>
        <Row label="Producto">{`${client.product} × ${client.quantity}`}</Row>
        <Row label="Valor estimado">
          {client.estimatedValueCrc > 0 ? formatCrc(client.estimatedValueCrc) : 'Por definir'}
        </Row>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-label={`Editar ${client.institution}`}
          onClick={onEdit}
          className="min-h-11 rounded-md border border-brand px-4 text-sm font-semibold text-brand"
        >
          Editar
        </button>
        <button
          type="button"
          aria-label={`Eliminar ${client.institution}`}
          onClick={onDelete}
          className="min-h-11 rounded-md border border-red-700 px-4 text-sm font-semibold text-red-700"
        >
          Eliminar
        </button>
      </div>
    </article>
  )
}

type EditOutcome = 'saved' | 'cancelled' | 'missing' | 'failed'

const MISSING_MESSAGE = 'Este contacto ya no existe: la lista se actualizó.'

function EditCard({ client, onDone }: { client: Client; onDone: (outcome: EditOutcome) => void }) {
  const [values, setValues] = useState<NewClientInput>(() => toInput(client))
  const [errors, setErrors] = useState<NewClientErrors>({})
  const refs = useRef<Partial<Record<NewClientField, HTMLInputElement | null>>>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    let result: ReturnType<typeof updateClientDetails>
    try {
      result = updateClientDetails(getClientRepository(), client.id, values)
    } catch {
      onDone('failed')
      return
    }
    if (result.ok) {
      onDone('saved')
      return
    }
    if ('errors' in result) {
      setErrors(result.errors)
      const first = CLIENT_FIELDS.find((f) => result.errors[f.name])
      if (first) refs.current[first.name]?.focus()
    } else {
      onDone('missing')
    }
  }

  return (
    <article aria-label={`Editando ${client.institution}`} className="rounded-lg border-2 border-brand bg-surface p-4">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <ClientFormFields
          idPrefix={`editar-${client.id}`}
          values={values}
          errors={errors}
          onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
          registerRef={(name, el) => {
            refs.current[name] = el
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="min-h-11 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={() => onDone('cancelled')}
            className="min-h-11 rounded-md border border-line px-4 text-sm font-semibold"
          >
            Cancelar edición
          </button>
        </div>
      </form>
    </article>
  )
}

/** Admin panel: every contact of every stage, with edit and delete (confirmed in-page). */
export function AdminPage() {
  const { clients, refresh } = useClients()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Client | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!deleting) return
    cancelRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDeleting(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [deleting])

  function finishEdit(outcome: EditOutcome) {
    setEditingId(null)
    if (outcome === 'cancelled') return
    // Whatever happened, re-read storage so the list never shows stale data.
    refresh()
    if (outcome === 'saved') setNotice('Cambios guardados.')
    else setError(outcome === 'missing' ? MISSING_MESSAGE : 'No se pudieron guardar los cambios. Intente de nuevo.')
  }

  function confirmDelete() {
    if (!deleting) return
    const name = deleting.institution
    let removed = false
    let failed = false
    try {
      removed = deleteClient(getClientRepository(), deleting.id)
    } catch {
      failed = true
    }
    setDeleting(null)
    refresh()
    if (failed) setError('No se pudo eliminar el contacto. Intente de nuevo.')
    else if (!removed) setError(MISSING_MESSAGE)
    else setNotice(`Contacto eliminado: ${name}.`)
  }

  return (
    <div>
      <h1 className="text-2xl text-brand">Administración</h1>
      <p className="mt-1 text-sm text-muted">
        Todos los contactos de todas las etapas: {clients.length}. Edite o elimine cualquier contacto.
      </p>
      {error && (
        <p role="alert" className="mt-3 break-words rounded-md border border-red-700 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-3 break-words rounded-md bg-accent/25 px-3 py-2 text-sm font-medium text-brand-dark">
          {notice}
        </p>
      )}
      {clients.length === 0 ? (
        <p className="mt-4 text-sm">No hay contactos registrados.</p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <li key={client.id} className="min-w-0">
              {editingId === client.id ? (
                <EditCard client={client} onDone={finishEdit} />
              ) : (
                <ContactCard
                  client={client}
                  onEdit={() => {
                    setNotice('')
                    setError('')
                    setEditingId(client.id)
                  }}
                  onDelete={() => {
                    setNotice('')
                    setError('')
                    setDeleting(client)
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {deleting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-brand-dark/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="eliminar-titulo"
            aria-describedby="eliminar-detalle"
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-lg border-2 border-brand bg-surface p-4 text-brand-dark"
          >
            <h2 id="eliminar-titulo" className="text-lg text-brand">
              ¿Eliminar este contacto?
            </h2>
            <p id="eliminar-detalle" className="mt-1 break-words text-sm">
              Se eliminará {deleting.institution} junto con su historial. Esta acción no se puede deshacer.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setDeleting(null)}
                className="min-h-11 rounded-md border border-line px-4 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="min-h-11 rounded-md bg-red-700 px-4 text-sm font-semibold text-white"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
