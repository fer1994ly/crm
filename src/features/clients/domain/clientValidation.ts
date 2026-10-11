import { STAGES } from '../../pipeline/domain/stage'
import type { Client, HistoryEntry, HistoryKind } from './client'

const HISTORY_KINDS: readonly HistoryKind[] = ['note', 'call', 'email', 'visit', 'whatsapp', 'stage']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isValidHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    typeof value.kind === 'string' &&
    (HISTORY_KINDS as readonly string[]).includes(value.kind) &&
    isNonEmptyString(value.text) &&
    typeof value.at === 'string' &&
    !Number.isNaN(Date.parse(value.at))
  )
}

/** Runtime guard for untrusted (stored) data: true only when the value is a complete, consistent Client. */
export function isValidClient(value: unknown): value is Client {
  if (!isRecord(value)) return false
  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.institution) &&
    isNonEmptyString(value.contactName) &&
    typeof value.phone === 'string' &&
    typeof value.email === 'string' &&
    isNonEmptyString(value.product) &&
    typeof value.quantity === 'number' &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0 &&
    typeof value.estimatedValueCrc === 'number' &&
    Number.isFinite(value.estimatedValueCrc) &&
    value.estimatedValueCrc >= 0 &&
    typeof value.stage === 'string' &&
    (STAGES as readonly string[]).includes(value.stage) &&
    Array.isArray(value.history) &&
    value.history.length > 0 &&
    value.history.every(isValidHistoryEntry)
  )
}
