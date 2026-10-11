import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, openStage, resetAndUnlock } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetAndUnlock(page, '/clientes/nuevo')
})

test('form has no horizontal overflow and a usable submit button', async ({ page }) => {
  await expectNoHorizontalOverflow(page)
  const submit = page.getByRole('button', { name: 'Registrar cliente' })
  await submit.scrollIntoViewIfNeeded()
  await expect(submit).toBeVisible()
  expect((await submit.boundingBox())!.height).toBeGreaterThanOrEqual(44)
})

test('does not submit when required fields are missing', async ({ page }) => {
  await page.getByRole('button', { name: 'Registrar cliente' }).click()
  await expect(page).toHaveURL(/\/clientes\/nuevo$/)
  await expect(page.getByText('Ingrese el nombre de la institución.')).toBeVisible()
  await expect(page.getByText('Ingrese una cantidad entera mayor que 0.')).toBeVisible()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('tiancy-crm:v1:clients') ?? '[]').length)
  expect(stored === 0 || stored === 12).toBe(true)
})

test('creates a client at Nuevo contacto that survives a reload', async ({ page }) => {
  await page.getByLabel(/Institución/).fill('Clínica Horizonte – Alajuela')
  await page.getByLabel(/Persona de contacto/).fill('Marta Solís')
  await page.getByLabel(/Correo electrónico/).fill('marta@horizonte.cr')
  await page.getByLabel(/Producto de interés/).fill('Oxímetros de pulso')
  await page.getByLabel(/Cantidad/).fill('8')
  await page.getByRole('button', { name: 'Registrar cliente' }).click()
  await expect(page.getByTestId('stage-badge')).toHaveText('Nuevo contacto')
  await page.goto('/')
  await page.reload()
  await openStage(page, 'Nuevo contacto')
  await expect(page.getByRole('article', { name: 'Clínica Horizonte – Alajuela' })).toBeVisible()
})
