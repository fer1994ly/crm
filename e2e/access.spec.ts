import { expect, test } from '@playwright/test'
import { CLIENTS_KEY, expectNoHorizontalOverflow, unlock } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
})

for (const path of ['/', '/clientes/cli-004', '/clientes/nuevo']) {
  test(`a fresh visit to ${path} shows only the login and no contact data`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1, name: 'Acceso' })).toBeVisible()
    await expect(page.getByLabel('Clave de acceso')).toBeVisible()
    await expect(page.getByText('Clave de demostración: tiancy2026')).toBeVisible()
    await expect(page.getByText('Hospital Metropolitano')).toHaveCount(0)
    await expect(page.getByText('Clínica Santa Lucía')).toHaveCount(0)
    expect(await page.evaluate((key) => localStorage.getItem(key), CLIENTS_KEY)).toBeNull()
    await expectNoHorizontalOverflow(page)
    const submit = page.getByRole('button', { name: 'Ingresar' })
    expect((await submit.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  })
}

test('a wrong password shows an inline error and keeps the app locked', async ({ page }) => {
  await page.goto('/')
  await unlock(page, 'equivocada')
  await expect(page.getByRole('alert')).toHaveText('Clave incorrecta.')
  await expect(page.getByText('Clínica Santa Lucía')).toHaveCount(0)
  expect(await page.evaluate((key) => localStorage.getItem(key), CLIENTS_KEY)).toBeNull()
})

test('unlocking lands on the board and keeps the unlock across a reload', async ({ page }) => {
  await page.goto('/')
  await unlock(page)
  await expect(page.getByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeVisible()
})

test('unlocking a deep link lands on that client', async ({ page }) => {
  await page.goto('/clientes/cli-004')
  await unlock(page)
  await expect(page.getByRole('heading', { level: 1, name: /Hospital Metropolitano/ })).toBeVisible()
  await expect(page).toHaveURL(/\/clientes\/cli-004$/)
})

test('logging out returns to the login screen', async ({ page }) => {
  await page.goto('/')
  await unlock(page)
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Acceso' })).toBeVisible()
  await expect(page.getByText('Clínica Santa Lucía')).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Acceso' })).toBeVisible()
})

test('a brand-new context restored from saved storage asks for the password again', async ({ page, context, browser }) => {
  await page.goto('/')
  await unlock(page)
  await page.getByRole('button', { name: /Mover a la siguiente etapa: EBAIS Desamparados Sur/ }).click()
  const state = await context.storageState()
  const fresh = await browser.newContext({ storageState: state })
  const freshPage = await fresh.newPage()
  await freshPage.goto('/')
  await expect(freshPage.getByRole('heading', { level: 1, name: 'Acceso' })).toBeVisible()
  await expect(freshPage.getByText('EBAIS Desamparados Sur')).toHaveCount(0)
  await fresh.close()
})
