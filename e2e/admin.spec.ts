import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto('/admin')
})

test('asks for a password before showing any contact', async ({ page }) => {
  await expect(page.getByLabel('Contraseña')).toBeVisible()
  await expect(page.getByText('Clínica Santa Lucía')).toHaveCount(0)
  await expect(page.getByRole('list', { name: 'Contactos' })).toHaveCount(0)
  const stored = await page.evaluate(() => localStorage.getItem('tiancy-crm:v1:clients'))
  expect(stored).toBeNull()
  await expectNoHorizontalOverflow(page)
})

test('rejects a wrong password and unlocks with the demo one', async ({ page }) => {
  await page.getByLabel('Contraseña').fill('equivocada')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page.getByText('Contraseña incorrecta.')).toBeVisible()
  await expect(page.getByRole('list', { name: 'Contactos' })).toHaveCount(0)

  await page.getByLabel('Contraseña').fill('tiancy2026')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page.getByRole('list', { name: 'Contactos' }).getByRole('listitem')).toHaveCount(12)
  await expectNoHorizontalOverflow(page)

  await page.reload()
  await expect(page.getByRole('list', { name: 'Contactos' })).toBeVisible()
  await page.getByRole('button', { name: 'Bloquear panel' }).click()
  await expect(page.getByLabel('Contraseña')).toBeVisible()
})

test('reset requires an in-page confirmation and restores demo data', async ({ page }) => {
  await page.getByLabel('Contraseña').fill('tiancy2026')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.getByRole('button', { name: 'Restablecer datos de ejemplo' }).click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Cancelar' }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: 'Restablecer datos de ejemplo' }).click()
  const confirm = page.getByRole('alertdialog').getByRole('button', { name: 'Sí, restablecer' })
  await confirm.scrollIntoViewIfNeeded()
  await confirm.click()
  await expect(page.getByRole('status')).toContainText('Datos de ejemplo restablecidos')
})

test('a client advanced on the board is listed in the admin panel', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Mover a la siguiente etapa: EBAIS Desamparados Sur' }).click()
  await page.goto('/admin')
  await page.getByLabel('Contraseña').fill('tiancy2026')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  const row = page.getByRole('listitem').filter({ hasText: 'EBAIS Desamparados Sur' })
  await expect(row).toContainText('Cotización enviada')
})

test('data survives a reopened session after reset', async ({ page, context, browser }) => {
  await page.getByLabel('Contraseña').fill('tiancy2026')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.getByRole('button', { name: 'Restablecer datos de ejemplo' }).click()
  const confirm = page.getByRole('alertdialog').getByRole('button', { name: 'Sí, restablecer' })
  await confirm.scrollIntoViewIfNeeded()
  await confirm.click()
  await expect(page.getByRole('status')).toContainText('Datos de ejemplo restablecidos')

  await page.goto('/')
  await page.getByRole('button', { name: 'Mover a la siguiente etapa: EBAIS Desamparados Sur' }).click()
  const state = await context.storageState()

  // A fresh page in the same context shares localStorage: the change survived the reset.
  const reopened = await context.newPage()
  await reopened.goto('/admin')
  await expect(reopened.getByLabel('Contraseña')).toBeVisible()
  await reopened.getByLabel('Contraseña').fill('tiancy2026')
  await reopened.getByRole('button', { name: 'Ingresar' }).click()
  const row = reopened.getByRole('listitem').filter({ hasText: 'EBAIS Desamparados Sur' })
  await expect(row).toContainText('Cotización enviada')

  // A brand-new context restored from saved storage (sessionStorage is not included) requires the password again.
  const fresh = await browser.newContext({ storageState: state })
  const freshPage = await fresh.newPage()
  await freshPage.goto('/admin')
  await expect(freshPage.getByLabel('Contraseña')).toBeVisible()
  await expect(freshPage.getByRole('list', { name: 'Contactos' })).toHaveCount(0)
  await fresh.close()
})
