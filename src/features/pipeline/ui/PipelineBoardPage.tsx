import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getClientRepository } from '../../../app/repositories'
import { ClientCard } from '../../clients/ui/ClientCard'
import { useClients } from '../../clients/ui/useClients'
import { advanceClientStage } from '../application/advanceClientStage'
import { STAGES, STAGE_LABELS, type StageId } from '../domain/stage'

export function PipelineBoardPage() {
  const { clients, refresh } = useClients()
  const [activeStage, setActiveStage] = useState<StageId>(STAGES[0])
  const [message, setMessage] = useState('')

  function handleAdvance(id: string) {
    try {
      const updated = advanceClientStage(getClientRepository(), id)
      setMessage(`${updated.institution} pasó a «${STAGE_LABELS[updated.stage]}».`)
      refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo mover el cliente.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl text-brand">Pipeline comercial</h1>
          <p className="mt-1 text-sm text-muted">
            {clients.length} cotizaciones institucionales activas, ordenadas por etapa de venta.
          </p>
        </div>
        <Link
          to="/clientes/nuevo"
          className="inline-flex min-h-11 items-center rounded-md bg-accent px-4 text-sm font-semibold text-brand-dark hover:brightness-95"
        >
          Agregar cliente
        </Link>
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm font-medium text-brand">
        {message}
      </p>

      <div
        role="tablist"
        aria-label="Etapas del pipeline"
        className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-2 md:hidden"
      >
        {STAGES.map((stage) => {
          const count = clients.filter((c) => c.stage === stage).length
          const selected = stage === activeStage
          return (
            <button
              key={stage}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveStage(stage)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium ${
                selected ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-brand-dark'
              }`}
            >
              {STAGE_LABELS[stage]} ({count})
            </button>
          )
        })}
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-5 md:items-start">
        {STAGES.map((stage) => {
          const inStage = clients.filter((c) => c.stage === stage)
          return (
            <section
              key={stage}
              aria-label={STAGE_LABELS[stage]}
              className={`${stage === activeStage ? 'block' : 'hidden'} min-w-0 md:block`}
            >
              <h2 className="mb-2 hidden items-center justify-between rounded-md bg-brand px-3 py-2 text-sm text-white md:flex">
                <span>{STAGE_LABELS[stage]}</span>
                <span aria-label={`${inStage.length} clientes`}>{inStage.length}</span>
              </h2>
              <div className="space-y-3">
                {inStage.length === 0 && (
                  <p className="rounded-lg border border-dashed border-line p-4 text-sm text-muted">
                    No hay clientes en esta etapa.
                  </p>
                )}
                {inStage.map((c) => (
                  <ClientCard key={c.id} client={c} onAdvance={handleAdvance} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
