import { STAGES, STAGE_LABELS, isClosedStage, nextStage } from './stage'

describe('pipeline stages', () => {
  it('keeps the five stages in sales order', () => {
    expect(STAGES.map((s) => STAGE_LABELS[s])).toEqual([
      'Nuevo contacto',
      'Cotización enviada',
      'En evaluación',
      'Negociación',
      'Pedido cerrado',
    ])
  })

  it('advances exactly one position', () => {
    expect(nextStage('nuevo-contacto')).toBe('cotizacion-enviada')
    expect(nextStage('cotizacion-enviada')).toBe('en-evaluacion')
    expect(nextStage('en-evaluacion')).toBe('negociacion')
    expect(nextStage('negociacion')).toBe('pedido-cerrado')
  })

  it('has no next stage after Pedido cerrado', () => {
    expect(nextStage('pedido-cerrado')).toBeNull()
    expect(isClosedStage('pedido-cerrado')).toBe(true)
    expect(isClosedStage('negociacion')).toBe(false)
  })
})
