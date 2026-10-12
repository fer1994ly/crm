import { expect, test } from '@playwright/test'
import { CLIENTS_KEY, expectNoHorizontalOverflow, resetAndUnlock, unlock } from './helpers'

test('a fresh visit to /admin asks for the password, then lands on the admin panel', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto('/admin')
  await expect(page.getByRole('heading', { level: 1, name: 'Acceso' })).toBeVisible()
  await expect(page.getByText('Clínica Santa Lucía')).toHaveCount(0)
  await unlock(page)
  await expect(page.getByRole('heading', { level: 1, name: 'Administración' })).toBeVisible()
  await expect(page).toHaveURL(/\/admin$/)
})

test.describe('admin panel', () => {
  test.beforeEach(async ({ page }) => {
    await resetAndUnlock(page, '/admin')
    await expect(page.getByRole('heading', { level: 1, name: 'Administración' })).toBeVisible()
  })

  test('lists all 12 contacts, has no horizontal overflow and 44px actions', async ({ page }) => {
    await expect(page.getByRole('article')).toHaveCount(12)
    await expect(page.getByTestId('stage-badge')).toHaveCount(12)
    await expectNoHorizontalOverflow(page)
    const edit = page.getByRole('button', { name: /^Editar / }).first()
    expect((await edit.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  })

  test('lists every stored contact across all 5 stages and keeps every action at 44px', async ({ page }) => {
    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]').length, CLIENTS_KEY)
    await expect(page.getByRole('article')).toHaveCount(stored)
    const stages = await page.getByTestId('stage-badge').allTextContents()
    expect(new Set(stages).size).toBe(5)
    for (const name of [/^Editar /, /^Eliminar /]) {
      for (const button of await page.getByRole('button', { name }).all()) {
        expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      }
    }
    await page.getByRole('button', { name: 'Editar EBAIS Desamparados Sur' }).click()
    for (const name of ['Guardar cambios', 'Cancelar edición']) {
      expect((await page.getByRole('button', { name }).boundingBox())!.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('reports an edit of a contact that no longer exists and refreshes the list', async ({ page }) => {
    await page.getByRole('button', { name: 'Editar EBAIS Desamparados Sur' }).click()
    await page.evaluate((key) => {
      const all = JSON.parse(localStorage.getItem(key) ?? '[]')
      localStorage.setItem(key, JSON.stringify(all.filter((c: { institution: string }) => c.institution !== 'EBAIS Desamparados Sur')))
    }, CLIENTS_KEY)
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(page.getByRole('alert')).toContainText('Este contacto ya no existe')
    await expect(page.getByRole('article')).toHaveCount(11)
    await expectNoHorizontalOverflow(page)
  })

  test('is reachable from the header link', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Administración' }).click()
    await expect(page).toHaveURL(/\/admin$/)
  })

  test('blocks invalid edits and persists a valid edit after reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Editar EBAIS Desamparados Sur' }).click()
    const institution = page.getByLabel(/Institución/)
    await institution.fill('')
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(page.getByText('Ingrese el nombre de la institución.')).toBeVisible()
    await expectNoHorizontalOverflow(page)

    await institution.fill('EBAIS Desamparados Norte')
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(page.getByRole('article', { name: 'EBAIS Desamparados Norte' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('article', { name: 'EBAIS Desamparados Norte' })).toBeVisible()
    await expect(page.getByRole('article', { name: 'EBAIS Desamparados Sur' })).toHaveCount(0)
  })

  test('deletes a contact after an in-page confirmation and stays deleted after reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Eliminar Laboratorio Clínico San José Centro' }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await dialog.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('article')).toHaveCount(12)

    await page.getByRole('button', { name: 'Eliminar Laboratorio Clínico San José Centro' }).click()
    await page.getByRole('button', { name: 'Sí, eliminar' }).click()
    await expect(page.getByRole('article')).toHaveCount(11)
    await page.reload()
    await expect(page.getByRole('article')).toHaveCount(11)
    await expect(page.getByRole('article', { name: 'Laboratorio Clínico San José Centro' })).toHaveCount(0)
    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]').length, CLIENTS_KEY)
    expect(stored).toBe(11)
  })
})
