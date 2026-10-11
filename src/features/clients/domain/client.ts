import { STAGE_LABELS, nextStage, type StageId } from '../../pipeline/domain/stage'
import { newId } from '../../../shared/ids'

export type HistoryKind = 'note' | 'call' | 'email' | 'visit' | 'whatsapp' | 'stage'

export interface HistoryEntry {
  id: string
  kind: HistoryKind
  text: string
  at: string
}

export interface Client {
  id: string
  institution: string
  contactName: string
  phone: string
  email: string
  product: string
  quantity: number
  estimatedValueCrc: number
  stage: StageId
  history: HistoryEntry[]
}

export function createHistoryEntry(kind: HistoryKind, text: string, at: string): HistoryEntry {
  return { id: newId('h'), kind, text, at }
}

export function appendHistory(client: Client, entry: HistoryEntry): Client {
  return { ...client, history: [...client.history, entry] }
}

export function advanceClient(client: Client, at: string): Client {
  const target = nextStage(client.stage)
  if (!target) {
    throw new Error('El pedido ya está cerrado y no puede avanzar.')
  }
  const entry = createHistoryEntry(
    'stage',
    `Etapa actualizada: ${STAGE_LABELS[client.stage]} → ${STAGE_LABELS[target]}`,
    at,
  )
  return appendHistory({ ...client, stage: target }, entry)
}

export function lastActivityAt(client: Client): string {
  return client.history.reduce((latest, e) => (e.at > latest ? e.at : latest), '')
}

export type SimulatedChannel = 'email' | 'whatsapp'

export function addNote(client: Client, text: string, at: string): Client {
  const clean = text.trim()
  if (!clean) throw new Error('La nota no puede estar vacía.')
  return appendHistory(client, createHistoryEntry('note', clean, at))
}

/** Local, simulated outreach: no external service is called, only the history is updated. */
export function logSimulatedContact(client: Client, channel: SimulatedChannel, at: string): Client {
  const entry =
    channel === 'email'
      ? createHistoryEntry('email', `Correo simulado enviado a ${client.contactName} con la cotización de ${client.product}.`, at)
      : createHistoryEntry('whatsapp', `Mensaje de WhatsApp simulado enviado a ${client.contactName} con el resumen de la cotización.`, at)
  return appendHistory(client, entry)
}
