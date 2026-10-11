export const STAGES = [
  'nuevo-contacto',
  'cotizacion-enviada',
  'en-evaluacion',
  'negociacion',
  'pedido-cerrado',
] as const

export type StageId = (typeof STAGES)[number]

export const STAGE_LABELS: Record<StageId, string> = {
  'nuevo-contacto': 'Nuevo contacto',
  'cotizacion-enviada': 'Cotización enviada',
  'en-evaluacion': 'En evaluación',
  negociacion: 'Negociación',
  'pedido-cerrado': 'Pedido cerrado',
}

export function nextStage(stage: StageId): StageId | null {
  const index = STAGES.indexOf(stage)
  return STAGES[index + 1] ?? null
}

export function isClosedStage(stage: StageId): boolean {
  return nextStage(stage) === null
}
