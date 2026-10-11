import { expect, test } from '@playwright/test'

const KEY = 'tiancy-crm:v1:clients'

test('board survives corrupted stored records and keeps the valid ones', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((key) => {
    const valid = {
      id: 'propio-1',
      institution: 'Clínica Propia Escazú',
      contactName: 'Marta Solís',
      phone: '',
      email: '',
      product: 'Camillas',
      quantity: 2,
      estimatedValueCrc: 0,
      stage: 'nuevo-contacto',
      history: [{ id: 'h-1', kind: 'note', text: 'Primer contacto', at: '2026-10-01T15:00:00.000Z' }],
    }
    const emptyHistory = { ...valid, id: 'roto-1', institution: 'Sin historial', history: [] }
    const unknownStage = { ...valid, id: 'roto-2', institution: 'Etapa rara', stage: 'archivado' }
    localStorage.setItem(key, JSON.stringify([valid, emptyHistory, unknownStage]))
  }, KEY)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeVisible()
  await expect(page.getByText('Clínica Propia Escazú').first()).toBeAttached()
  await expect(page.getByText('Sin historial')).toHaveCount(0)
  await expect(page.getByText('Etapa rara')).toHaveCount(0)
})
