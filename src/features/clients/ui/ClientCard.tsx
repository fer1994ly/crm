import { Link } from 'react-router-dom'
import { formatCrc } from '../../../shared/money'
import { formatDate } from '../../../shared/dates'
import { isClosedStage } from '../../pipeline/domain/stage'
import { lastActivityAt, type Client } from '../domain/client'

interface Props {
  client: Client
  onAdvance: (id: string) => void
}

export function ClientCard({ client, onAdvance }: Props) {
  const closed = isClosedStage(client.stage)
  return (
    <article
      aria-label={client.institution}
      className="rounded-lg border border-line bg-surface p-4 shadow-sm"
    >
      <h3 className="text-base leading-snug text-brand">
        <Link to={`/clientes/${client.id}`} className="underline-offset-2 hover:underline">
          {client.institution}
        </Link>
      </h3>
      <dl className="mt-2 space-y-1 text-sm">
        <div>
          <dt className="sr-only">Producto de interés</dt>
          <dd className="font-medium">{client.product}</dd>
        </div>
        <div className="flex justify-between gap-2 text-muted">
          <dt>Cantidad</dt>
          <dd className="text-brand-dark">{client.quantity}</dd>
        </div>
        <div className="flex justify-between gap-2 text-muted">
          <dt>Valor estimado</dt>
          <dd className="text-brand-dark font-semibold">
            {client.estimatedValueCrc > 0 ? formatCrc(client.estimatedValueCrc) : 'Por definir'}
          </dd>
        </div>
        <div className="flex justify-between gap-2 text-muted">
          <dt>Contacto</dt>
          <dd className="text-brand-dark text-right">{client.contactName}</dd>
        </div>
        <div className="flex justify-between gap-2 text-muted">
          <dt>Última actividad</dt>
          <dd className="text-brand-dark">{formatDate(lastActivityAt(client))}</dd>
        </div>
      </dl>
      <div className="mt-3">
        <button
          type="button"
          disabled={closed}
          onClick={() => onAdvance(client.id)}
          aria-label={`Mover a la siguiente etapa: ${client.institution}`}
          className="min-h-11 w-full rounded-md bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          Mover a la siguiente etapa
        </button>
        {closed && <p className="mt-1 text-xs text-muted">Pedido cerrado: no hay etapa siguiente.</p>}
      </div>
    </article>
  )
}
