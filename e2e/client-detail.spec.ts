import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.goto('/clientes/cli-004')
})

test('detail page shows data and timeline without horizontal overflow', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: /Hospital Metropolitano/ })).toBeVisible()
  await expect(page.getByRole('list', { name: 'Historial de contacto' })).toContainText('Cotización formal enviada')
  await expectNoHorizontalOverflow(page)
  for (const name of ['Guardar nota', 'Enviar cotización por correo', 'Enviar por WhatsApp']) {
    const button = page.getByRole('button', { name })
    await button.scrollIntoViewIfNeeded()
    await expect(button).toBeVisible()
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }
})

test('a new note persists after reload', async ({ page }) => {
  await page.getByLabel('Nueva nota').fill('Coordinar demostración con biomédica')
  await page.getByRole('button', { name: 'Guardar nota' }).click()
  await expect(page.getByRole('list', { name: 'Historial de contacto' })).toContainText(
    'Coordinar demostración con biomédica',
  )
  await page.reload()
  await expect(page.getByRole('list', { name: 'Historial de contacto' })).toContainText(
    'Coordinar demostración con biomédica',
  )
})

test('advances the stage from the detail page without reloading', async ({ page }) => {
  await page.getByRole('button', { name: /Mover a la siguiente etapa/ }).click()
  await expect(page.getByTestId('stage-badge')).toHaveText('En evaluación')
  await page.reload()
  await expect(page.getByTestId('stage-badge')).toHaveText('En evaluación')
})

test('simulated email is logged in the history', async ({ page }) => {
  await page.getByRole('button', { name: 'Enviar cotización por correo' }).click()
  await expect(page.getByRole('list', { name: 'Historial de contacto' })).toContainText('Correo simulado enviado')
})

test('opens from the board card link', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Clínica Santa Lucía – Heredia' }).click()
  await expect(page.getByRole('heading', { level: 1, name: /Clínica Santa Lucía/ })).toBeVisible()
})
