import { Link } from 'react-router-dom'
import { formatCrc } from '../../../shared/money'
import { formatDate } from '../../../shared/dates'
import { AdvanceStageButton } from '../../pipeline/ui/AdvanceStageButton'
import { lastActivityAt, type Client } from '../domain/client'

interface Props {
  client: Client
  onAdvance: (id: string) => void
}

export function ClientCard({ client, onAdvance }: Props) {
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
        <AdvanceStageButton client={client} onAdvance={onAdvance} />
      </div>
    </article>
  )
}
