import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, openAccountMenu, openStage, resetAndUnlock } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetAndUnlock(page, '/')
})

test('the open menu is fully visible, has 44px targets and causes no horizontal overflow', async ({ page }) => {
  await openAccountMenu(page)
  const viewport = page.viewportSize()!
  for (const name of ['Cuenta', 'Restablecer datos de ejemplo', 'Cerrar sesión']) {
    const box = (await page.getByRole('button', { name }).boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
  }
  await expectNoHorizontalOverflow(page)
})

test('Escape and an outside click close the menu', async ({ page }) => {
  await openAccountMenu(page)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toHaveCount(0)
  await openAccountMenu(page)
  await page.getByRole('contentinfo').click()
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toHaveCount(0)
})

test('logging out from the menu returns to the login screen', async ({ page }) => {
  await openAccountMenu(page)
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Acceso' })).toBeVisible()
  await expect(page.getByText('Clínica Santa Lucía')).toHaveCount(0)
})

test('reset asks for confirmation in the page and restores the sample data', async ({ page }) => {
  await page.getByRole('button', { name: 'Mover a la siguiente etapa: EBAIS Desamparados Sur' }).click()

  await openAccountMenu(page)
  await page.getByRole('button', { name: 'Restablecer datos de ejemplo' }).click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await dialog.getByRole('button', { name: 'Cancelar' }).click()
  await expect(dialog).toHaveCount(0)

  await openAccountMenu(page)
  await page.getByRole('button', { name: 'Restablecer datos de ejemplo' }).click()
  const confirm = page.getByRole('alertdialog').getByRole('button', { name: 'Sí, restablecer' })
  await expect(confirm).toBeInViewport()
  expect((await confirm.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await confirm.click()
  await expect(page.getByText('Datos de ejemplo restablecidos.')).toBeVisible()

  await openStage(page, 'Nuevo contacto')
  await expect(page.getByRole('article', { name: 'EBAIS Desamparados Sur' })).toBeVisible()
})
