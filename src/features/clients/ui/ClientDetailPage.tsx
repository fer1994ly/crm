import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getClientRepository } from '../../../app/repositories'
import { formatCrc } from '../../../shared/money'
import { formatDateTime } from '../../../shared/dates'
import { advanceClientStage } from '../../pipeline/application/advanceClientStage'
import { STAGE_LABELS } from '../../pipeline/domain/stage'
import { AdvanceStageButton } from '../../pipeline/ui/AdvanceStageButton'
import { addClientNote, getClient, sendSimulatedContact } from '../application/clientActions'
import { sortHistoryNewestFirst } from '../domain/historyOrder'
import type { Client, HistoryKind, SimulatedChannel } from '../domain/client'

const KIND_LABELS: Record<HistoryKind, string> = {
  note: 'Nota',
  call: 'Llamada',
  email: 'Correo',
  visit: 'Visita',
  whatsapp: 'WhatsApp',
  stage: 'Etapa',
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 break-words font-medium">{value}</dd>
    </div>
  )
}

/**
 * Keys the page by route id so navigating between clients remounts it and
 * drops per-client state (client data, note draft, alerts, unavailable view).
 */
export function ClientDetailPage() {
  const { id = '' } = useParams()
  return <ClientDetail key={id} id={id} />
}

function ClientDetail({ id }: { id: string }) {
  const [client, setClient] = useState<Client | undefined>(() => getClient(getClientRepository(), id))
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  if (!client) {
    return (
      <div>
        <h1 className="text-2xl text-brand">Cliente no disponible</h1>
        {error ? (
          <p role="alert" className="mt-2 font-medium text-red-700">
            {error}
          </p>
        ) : (
          <p className="mt-2">No encontramos este cliente.</p>
        )}
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand underline">
          {error ? 'Volver al tablero' : 'Volver al pipeline'}
        </Link>
      </div>
    )
  }

  /** Runs a use case; on failure shows its message and drops stale data if the client vanished. */
  function run(action: () => Client, successNotice: string): boolean {
    try {
      setClient(action())
      setError('')
      setNotice(successNotice)
      return true
    } catch (e) {
      setNotice('')
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción.')
      if (!getClient(getClientRepository(), id)) setClient(undefined)
      return false
    }
  }

  function submitNote(event: FormEvent) {
    event.preventDefault()
    if (!note.trim()) {
      setNoteError('Escriba el contenido de la nota.')
      return
    }
    if (run(() => addClientNote(getClientRepository(), id, note), 'Nota guardada.')) {
      setNote('')
      setNoteError('')
    }
  }

  function advance() {
    run(() => advanceClientStage(getClientRepository(), id), 'Etapa actualizada.')
  }

  function simulate(channel: SimulatedChannel) {
    run(
      () => sendSimulatedContact(getClientRepository(), id, channel),
      channel === 'email' ? 'Correo simulado registrado en el historial.' : 'WhatsApp simulado registrado en el historial.',
    )
  }

  const timeline = sortHistoryNewestFirst(client.history)

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline">
          ← Volver al pipeline
        </Link>
        <h1 className="text-2xl text-brand">{client.institution}</h1>
        <p className="mt-2">
          <span
            data-testid="stage-badge"
            className="inline-block rounded-full bg-accent/25 px-3 py-1 text-sm font-semibold text-brand-dark"
          >
            {STAGE_LABELS[client.stage]}
          </span>
        </p>
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-sm font-medium text-brand">
        {notice}
      </p>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <section aria-labelledby="datos" className="rounded-lg border border-line bg-surface p-4">
        <h2 id="datos" className="mb-3 text-lg text-brand">
          Datos del cliente
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label="Persona de contacto" value={client.contactName} />
          <Field label="Teléfono" value={client.phone || 'No registrado'} />
          <Field label="Correo" value={client.email || 'No registrado'} />
          <Field label="Producto de interés" value={client.product} />
          <Field label="Cantidad" value={String(client.quantity)} />
          <Field
            label="Valor estimado"
            value={client.estimatedValueCrc > 0 ? formatCrc(client.estimatedValueCrc) : 'Por definir'}
          />
        </dl>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <AdvanceStageButton client={client} onAdvance={advance} />
          <div>
            <button
              type="button"
              onClick={() => simulate('email')}
              className="min-h-11 w-full rounded-md border border-brand px-3 text-sm font-semibold text-brand hover:bg-brand/10"
            >
              Enviar cotización por correo
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => simulate('whatsapp')}
              className="min-h-11 w-full rounded-md border border-brand px-3 text-sm font-semibold text-brand hover:bg-brand/10"
            >
              Enviar por WhatsApp
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Los envíos son simulados: solo se registran en el historial, no se contacta a nadie.
        </p>
      </section>

      <section aria-labelledby="historial" className="rounded-lg border border-line bg-surface p-4">
        <h2 id="historial" className="mb-3 text-lg text-brand">
          Historial de contacto
        </h2>
        <form onSubmit={submitNote} noValidate className="mb-4">
          <label htmlFor="nueva-nota" className="block text-sm font-medium">
            Nueva nota
          </label>
          <textarea
            id="nueva-nota"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            aria-invalid={noteError ? true : undefined}
            aria-describedby={noteError ? 'nota-error' : undefined}
            className="mt-1 w-full rounded-md border border-line p-2 text-base"
          />
          {noteError && (
            <p id="nota-error" className="mt-1 text-sm font-medium text-red-700">
              {noteError}
            </p>
          )}
          <button
            type="submit"
            className="mt-2 min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-brand-dark hover:brightness-95"
          >
            Guardar nota
          </button>
        </form>
        <ol aria-label="Historial de contacto" className="space-y-3 border-l-2 border-line pl-4">
          {timeline.map((entry) => (
            <li key={entry.id} className="relative">
              <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-brand" aria-hidden="true" />
              <p className="text-xs text-muted">
                {KIND_LABELS[entry.kind]} · {formatDateTime(entry.at)}
              </p>
              <p className="text-sm">{entry.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
