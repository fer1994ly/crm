import type { Client } from '../../clients/domain/client'
import { isClosedStage } from '../domain/stage'

interface Props {
  client: Client
  onAdvance: (id: string) => void
}

export function AdvanceStageButton({ client, onAdvance }: Props) {
  const closed = isClosedStage(client.stage)
  return (
    <div>
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
  )
}
